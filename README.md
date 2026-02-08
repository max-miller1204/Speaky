# Speaky

**A free, open source speech-to-text application with both offline and online transcription.**

Speaky is a fork of [Handy](https://github.com/cjpais/Handy) — a cross-platform desktop application built with Tauri (Rust + React/TypeScript). Press a shortcut, speak, and have your words appear in any text field. Speaky adds support for online STT via any OpenAI-compatible API, alongside the existing fully-offline transcription.

## Features

- **Local transcription** — completely offline using Whisper or Parakeet models
- **Online transcription** — via OpenAI-compatible `/v1/audio/transcriptions` API
  - Built-in support for **OpenAI** (whisper-1) and **Groq** (whisper-large-v3-turbo)
  - Custom provider support for any OpenAI-compatible endpoint
- **Privacy-focused** — local mode keeps your voice entirely on your machine
- **Cross-platform** — macOS, Windows, and Linux

## How It Works

1. **Press** a configurable keyboard shortcut to start/stop recording (or use push-to-talk mode)
2. **Speak** your words while the shortcut is active
3. **Release** and Speaky processes your speech using your chosen transcription method
4. **Get** your transcribed text pasted directly into whatever app you're using

### Transcription Modes

**Local (offline):**
- Silence is filtered using VAD (Voice Activity Detection) with Silero
- Transcription uses your choice of models:
  - **Whisper models** (Small/Medium/Turbo/Large) with GPU acceleration when available
  - **Parakeet V3** — CPU-optimized model with excellent performance and automatic language detection

**Online:**
- Audio is sent to an OpenAI-compatible API endpoint for transcription
- Configure your preferred provider and API key in Settings

## Quick Start

### Installation

1. Download the latest release from the [releases page](https://github.com/maxmillerdev/Speaky/releases)
2. Install the application
3. Launch Speaky and grant necessary system permissions (microphone, accessibility)
4. Configure your preferred keyboard shortcuts and transcription mode in Settings
5. Start transcribing!

### Development Setup

For detailed build instructions including platform-specific requirements, see [BUILD.md](BUILD.md).

```bash
# Install dependencies
bun install

# Download required model
mkdir -p src-tauri/resources/models
curl -o src-tauri/resources/models/silero_vad_v4.onnx https://blob.handy.computer/silero_vad_v4.onnx

# Run in development mode
bun run tauri dev

# Build for production
bun run tauri build
```

## Architecture

Speaky is built as a Tauri application combining:

- **Frontend**: React + TypeScript with Tailwind CSS for the settings UI
- **Backend**: Rust for system integration, audio processing, and ML inference
- **Core Libraries**:
  - `whisper-rs`: Local speech recognition with Whisper models
  - `transcription-rs`: CPU-optimized speech recognition with Parakeet models
  - `cpal`: Cross-platform audio I/O
  - `vad-rs`: Voice Activity Detection
  - `rdev`: Global keyboard shortcuts and system events
  - `reqwest`: HTTP client for online STT API calls

### Debug Mode

Access debug features by pressing:

- **macOS**: `Cmd+Shift+D`
- **Windows/Linux**: `Ctrl+Shift+D`

## Known Issues & Limitations

### Major Issues

**Whisper Model Crashes:**
- Whisper models crash on certain system configurations (Windows and Linux)
- Does not affect all systems — issue is configuration-dependent

**Wayland Support (Linux):**
- Limited support for Wayland display server
- Requires [`wtype`](https://github.com/atx/wtype) or [`dotool`](https://sr.ht/~geb/dotool/) for text input to work correctly (see [Linux Notes](#linux-notes) below)

### Linux Notes

**Text Input Tools:**

For reliable text input on Linux, install the appropriate tool for your display server:

| Display Server | Recommended Tool | Install Command                                    |
| -------------- | ---------------- | -------------------------------------------------- |
| X11            | `xdotool`        | `sudo apt install xdotool`                         |
| Wayland        | `wtype`          | `sudo apt install wtype`                           |
| Both           | `dotool`         | `sudo apt install dotool` (requires `input` group) |

- **dotool setup**: Requires adding your user to the `input` group: `sudo usermod -aG input $USER` (then log out and back in)

**Other Notes:**

- The recording overlay is disabled by default on Linux (`Overlay Position: None`) because certain compositors treat it as the active window, which can steal focus and prevent pasting.
- If you are having trouble with the app, running with `WEBKIT_DISABLE_DMABUF_RENDERER=1` may help.
- You can control the app via signals: sending `SIGUSR2` to the process toggles recording on/off:
  ```ini
  # Example Sway/Hyprland keybinding
  bindsym $mod+o exec pkill -USR2 -n speaky
  ```

### Platform Support

- **macOS** (both Intel and Apple Silicon)
- **x64 Windows**
- **x64 Linux**

### System Requirements

**For Whisper Models:**
- **macOS**: M series Mac, Intel Mac
- **Windows**: Intel, AMD, or NVIDIA GPU
- **Linux**: Intel, AMD, or NVIDIA GPU

**For Parakeet V3 Model:**
- CPU-only operation — runs on a wide variety of hardware
- Minimum: Intel Skylake (6th gen) or equivalent AMD processors

**For Online Transcription:**
- An API key for your chosen provider (OpenAI, Groq, or custom)
- Internet connection

## Troubleshooting

### Manual Model Installation (For Proxy Users or Network Restrictions)

If you're behind a proxy or firewall where Speaky cannot download models automatically, you can manually download and install them.

#### Step 1: Find Your App Data Directory

Open Speaky settings and navigate to the **About** section, or check:

- **macOS**: `~/Library/Application Support/com.speaky.app/`
- **Windows**: `C:\Users\{username}\AppData\Roaming\com.speaky.app\`
- **Linux**: `~/.config/com.speaky.app/`

#### Step 2: Create Models Directory

```bash
# macOS/Linux
mkdir -p ~/.config/com.speaky.app/models  # adjust path per OS

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path "$env:APPDATA\com.speaky.app\models"
```

#### Step 3: Download Model Files

**Whisper Models (single .bin files):**

- Small (487 MB): `https://blob.handy.computer/ggml-small.bin`
- Medium (492 MB): `https://blob.handy.computer/whisper-medium-q4_1.bin`
- Turbo (1600 MB): `https://blob.handy.computer/ggml-large-v3-turbo.bin`
- Large (1100 MB): `https://blob.handy.computer/ggml-large-v3-q5_0.bin`

**Parakeet Models (compressed archives):**

- V2 (473 MB): `https://blob.handy.computer/parakeet-v2-int8.tar.gz`
- V3 (478 MB): `https://blob.handy.computer/parakeet-v3-int8.tar.gz`

#### Step 4: Install Models

**For Whisper Models:** Place the `.bin` file directly into the `models` directory.

**For Parakeet Models:** Extract the `.tar.gz` archive and place the extracted directory into the `models` folder. The directory must be named exactly:
- `parakeet-tdt-0.6b-v2-int8`
- `parakeet-tdt-0.6b-v3-int8`

#### Step 5: Verify

Restart Speaky, open Settings > Models, and your models should appear as "Downloaded".

## Upstream

Speaky is a fork of [Handy](https://github.com/cjpais/Handy) by [CJ Pais](https://github.com/cjpais). See the upstream project for the original work and community.

## License

MIT License — see [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[Handy](https://github.com/cjpais/Handy)** — the upstream project this fork is based on
- **Whisper** by OpenAI for the speech recognition model
- **whisper.cpp and ggml** for cross-platform whisper inference/acceleration
- **Silero** for lightweight VAD
- **Tauri** for the Rust-based app framework
