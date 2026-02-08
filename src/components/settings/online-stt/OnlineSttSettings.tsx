import React from "react";
import { useTranslation } from "react-i18next";
import { SettingContainer } from "../../ui/SettingContainer";
import { ProviderSelect } from "../PostProcessingSettingsApi/ProviderSelect";
import { BaseUrlField } from "../PostProcessingSettingsApi/BaseUrlField";
import { ApiKeyField } from "../PostProcessingSettingsApi/ApiKeyField";
import { Input } from "../../ui/Input";
import { useSttProviderState } from "./useSttProviderState";

const OnlineSttSettingsComponent: React.FC = () => {
  const { t } = useTranslation();
  const state = useSttProviderState();

  return (
    <>
      <SettingContainer
        title={t("settings.onlineStt.provider.title")}
        description={t("settings.onlineStt.provider.description")}
        descriptionMode="tooltip"
        layout="horizontal"
        grouped={true}
      >
        <div className="flex items-center gap-2">
          <ProviderSelect
            options={state.providerOptions}
            value={state.selectedProviderId}
            onChange={state.handleProviderSelect}
          />
        </div>
      </SettingContainer>

      {state.isCustomProvider && (
        <SettingContainer
          title={t("settings.onlineStt.baseUrl.title")}
          description={t("settings.onlineStt.baseUrl.description")}
          descriptionMode="tooltip"
          layout="horizontal"
          grouped={true}
        >
          <div className="flex items-center gap-2">
            <BaseUrlField
              value={state.baseUrl}
              onBlur={state.handleBaseUrlChange}
              placeholder={t("settings.onlineStt.baseUrl.placeholder")}
              disabled={state.isBaseUrlUpdating}
              className="min-w-[380px]"
            />
          </div>
        </SettingContainer>
      )}

      <SettingContainer
        title={t("settings.onlineStt.apiKey.title")}
        description={t("settings.onlineStt.apiKey.description")}
        descriptionMode="tooltip"
        layout="horizontal"
        grouped={true}
      >
        <div className="flex items-center gap-2">
          <ApiKeyField
            value={state.apiKey}
            onBlur={state.handleApiKeyChange}
            placeholder={t("settings.onlineStt.apiKey.placeholder")}
            disabled={state.isApiKeyUpdating}
            className="min-w-[320px]"
          />
        </div>
      </SettingContainer>

      <SettingContainer
        title={t("settings.onlineStt.model.title")}
        description={t("settings.onlineStt.model.description")}
        descriptionMode="tooltip"
        layout="horizontal"
        grouped={true}
      >
        <div className="flex items-center gap-2">
          <SttModelField
            value={state.model}
            onBlur={state.handleModelChange}
            disabled={state.isModelUpdating}
          />
        </div>
      </SettingContainer>
    </>
  );
};

const SttModelField: React.FC<{
  value: string;
  onBlur: (value: string) => void;
  disabled: boolean;
}> = React.memo(({ value, onBlur, disabled }) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <Input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onBlur(localValue)}
      placeholder={t("settings.onlineStt.model.placeholder")}
      variant="compact"
      disabled={disabled}
      className="flex-1 min-w-[280px]"
    />
  );
});

SttModelField.displayName = "SttModelField";

export const OnlineSttSettings = React.memo(OnlineSttSettingsComponent);
OnlineSttSettings.displayName = "OnlineSttSettings";
