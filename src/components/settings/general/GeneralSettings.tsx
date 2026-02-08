import React from "react";
import { useTranslation } from "react-i18next";
import { MicrophoneSelector } from "../MicrophoneSelector";
import { LanguageSelector } from "../LanguageSelector";
import { ShortcutInput } from "../ShortcutInput";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { SettingContainer } from "../../ui/SettingContainer";
import { OutputDeviceSelector } from "../OutputDeviceSelector";
import { PushToTalk } from "../PushToTalk";
import { AudioFeedback } from "../AudioFeedback";
import { useSettings } from "../../../hooks/useSettings";
import { useModelStore } from "../../../stores/modelStore";
import { VolumeSlider } from "../VolumeSlider";
import { MuteWhileRecording } from "../MuteWhileRecording";
import { Dropdown } from "../../ui/Dropdown";
import { OnlineSttSettings } from "../online-stt/OnlineSttSettings";

export const GeneralSettings: React.FC = () => {
  const { t } = useTranslation();
  const { settings, audioFeedbackEnabled, updateSetting } = useSettings();
  const { currentModel, getModelInfo } = useModelStore();
  const currentModelInfo = getModelInfo(currentModel);

  const transcriptionMode = settings?.transcription_mode || "local";
  const isOnlineMode = transcriptionMode === "online";
  const showLanguageSelector =
    !isOnlineMode && currentModelInfo?.engine_type === "Whisper";

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      <SettingsGroup title={t("settings.general.title")}>
        <ShortcutInput shortcutId="transcribe" grouped={true} />
        <SettingContainer
          title={t("settings.transcriptionMode.title")}
          description={t("settings.transcriptionMode.description")}
          descriptionMode="tooltip"
          layout="horizontal"
          grouped={true}
        >
          <Dropdown
            options={[
              {
                value: "local",
                label: t("settings.transcriptionMode.local"),
              },
              {
                value: "online",
                label: t("settings.transcriptionMode.online"),
              },
            ]}
            selectedValue={transcriptionMode}
            onSelect={(value) => updateSetting("transcription_mode", value as any)}
            className="min-w-[160px]"
          />
        </SettingContainer>
        {showLanguageSelector && (
          <LanguageSelector descriptionMode="tooltip" grouped={true} />
        )}
        <PushToTalk descriptionMode="tooltip" grouped={true} />
      </SettingsGroup>

      {isOnlineMode && (
        <SettingsGroup title={t("settings.onlineStt.title")}>
          <OnlineSttSettings />
        </SettingsGroup>
      )}

      <SettingsGroup title={t("settings.sound.title")}>
        <MicrophoneSelector descriptionMode="tooltip" grouped={true} />
        <MuteWhileRecording descriptionMode="tooltip" grouped={true} />
        <AudioFeedback descriptionMode="tooltip" grouped={true} />
        <OutputDeviceSelector
          descriptionMode="tooltip"
          grouped={true}
          disabled={!audioFeedbackEnabled}
        />
        <VolumeSlider disabled={!audioFeedbackEnabled} />
      </SettingsGroup>
    </div>
  );
};
