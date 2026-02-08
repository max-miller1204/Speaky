use crate::settings::SttProvider;
use hound::{SampleFormat, WavSpec, WavWriter};
use log::debug;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, USER_AGENT};
use reqwest::multipart::{Form, Part};
use serde::Deserialize;
use std::io::Cursor;
use std::time::Duration;

#[derive(Debug, Deserialize)]
struct TranscriptionResponse {
    text: String,
}

/// Encode Vec<f32> 16kHz mono samples into an in-memory WAV buffer.
fn encode_wav_in_memory(samples: &[f32]) -> Result<Vec<u8>, String> {
    let spec = WavSpec {
        channels: 1,
        sample_rate: 16000,
        bits_per_sample: 16,
        sample_format: SampleFormat::Int,
    };
    let mut buffer = Cursor::new(Vec::new());
    let mut writer =
        WavWriter::new(&mut buffer, spec).map_err(|e| format!("Failed to create WAV writer: {}", e))?;
    for sample in samples {
        let sample_i16 = (*sample * i16::MAX as f32).clamp(i16::MIN as f32, i16::MAX as f32) as i16;
        writer
            .write_sample(sample_i16)
            .map_err(|e| format!("Failed to write WAV sample: {}", e))?;
    }
    writer
        .finalize()
        .map_err(|e| format!("Failed to finalize WAV: {}", e))?;
    Ok(buffer.into_inner())
}

fn build_stt_headers(api_key: &str) -> Result<HeaderMap, String> {
    let mut headers = HeaderMap::new();

    headers.insert(USER_AGENT, HeaderValue::from_static("Speaky/1.0"));

    if !api_key.is_empty() {
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key))
                .map_err(|e| format!("Invalid authorization header value: {}", e))?,
        );
    }

    Ok(headers)
}

fn create_stt_client(api_key: &str) -> Result<reqwest::Client, String> {
    let headers = build_stt_headers(api_key)?;
    reqwest::Client::builder()
        .default_headers(headers)
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))
}

/// Send audio to an OpenAI-compatible speech-to-text API.
pub async fn transcribe_online(
    provider: &SttProvider,
    api_key: &str,
    model: &str,
    audio_samples: &[f32],
    language: Option<&str>,
) -> Result<String, String> {
    let wav_data = encode_wav_in_memory(audio_samples)?;

    let base_url = provider.base_url.trim_end_matches('/');
    let url = format!("{}/audio/transcriptions", base_url);

    debug!("Sending STT request to: {} (model: {})", url, model);

    let mut form = Form::new()
        .text("model", model.to_string())
        .text("response_format", "json".to_string())
        .part(
            "file",
            Part::bytes(wav_data)
                .file_name("audio.wav")
                .mime_str("audio/wav")
                .map_err(|e| format!("Failed to set MIME type: {}", e))?,
        );

    if let Some(lang) = language {
        if lang != "auto" && !lang.is_empty() {
            form = form.text("language", lang.to_string());
        }
    }

    let client = create_stt_client(api_key)?;
    let response = client
        .post(&url)
        .multipart(form)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                "STT request timed out. Try a shorter recording.".to_string()
            } else if e.is_connect() {
                format!(
                    "Could not connect to STT provider ({}). Check your internet connection.",
                    provider.label
                )
            } else {
                format!("STT request failed: {}", e)
            }
        })?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());

        return Err(match status.as_u16() {
            401 => format!("Invalid API key for {}.", provider.label),
            429 => format!(
                "Rate limited by {}. Please wait and try again.",
                provider.label
            ),
            413 => "Audio too long for API. Try a shorter recording.".to_string(),
            _ => format!("STT API error ({}): {}", status, error_text),
        });
    }

    let result: TranscriptionResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse STT response: {}", e))?;

    Ok(result.text)
}
