import { useCallback, useMemo } from "react";
import { useSettingsStore } from "../../../stores/settingsStore";
import type { SttProvider } from "@/bindings";
import type { DropdownOption } from "../../ui/Dropdown";

type SttProviderState = {
  providerOptions: DropdownOption[];
  selectedProviderId: string;
  selectedProvider: SttProvider | undefined;
  isCustomProvider: boolean;
  baseUrl: string;
  handleBaseUrlChange: (value: string) => void;
  isBaseUrlUpdating: boolean;
  apiKey: string;
  handleApiKeyChange: (value: string) => void;
  isApiKeyUpdating: boolean;
  model: string;
  handleModelChange: (value: string) => void;
  isModelUpdating: boolean;
  handleProviderSelect: (providerId: string) => void;
};

export const useSttProviderState = (): SttProviderState => {
  const settings = useSettingsStore((s) => s.settings);
  const isUpdatingKey = useSettingsStore((s) => s.isUpdatingKey);
  const setSttProvider = useSettingsStore((s) => s.setSttProvider);
  const updateSttApiKey = useSettingsStore((s) => s.updateSttApiKey);
  const updateSttModel = useSettingsStore((s) => s.updateSttModel);
  const updateSttBaseUrl = useSettingsStore((s) => s.updateSttBaseUrl);

  const providers = settings?.stt_providers || [];

  const selectedProviderId = useMemo(() => {
    return settings?.stt_provider_id || providers[0]?.id || "openai";
  }, [providers, settings?.stt_provider_id]);

  const selectedProvider = useMemo(() => {
    return (
      providers.find((p) => p.id === selectedProviderId) || providers[0]
    );
  }, [providers, selectedProviderId]);

  const baseUrl = selectedProvider?.base_url ?? "";
  const apiKey = settings?.stt_api_keys?.[selectedProviderId] ?? "";
  const model = settings?.stt_models?.[selectedProviderId] ?? "";

  const providerOptions = useMemo<DropdownOption[]>(() => {
    return providers.map((p) => ({
      value: p.id,
      label: p.label,
    }));
  }, [providers]);

  const handleProviderSelect = useCallback(
    (providerId: string) => {
      if (providerId === selectedProviderId) return;
      void setSttProvider(providerId);
    },
    [selectedProviderId, setSttProvider],
  );

  const handleBaseUrlChange = useCallback(
    (value: string) => {
      if (!selectedProvider || !selectedProvider.allow_base_url_edit) return;
      const trimmed = value.trim();
      if (trimmed && trimmed !== baseUrl) {
        void updateSttBaseUrl(selectedProvider.id, trimmed);
      }
    },
    [selectedProvider, baseUrl, updateSttBaseUrl],
  );

  const handleApiKeyChange = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed !== apiKey) {
        void updateSttApiKey(selectedProviderId, trimmed);
      }
    },
    [apiKey, selectedProviderId, updateSttApiKey],
  );

  const handleModelChange = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed !== model) {
        void updateSttModel(selectedProviderId, trimmed);
      }
    },
    [model, selectedProviderId, updateSttModel],
  );

  const isBaseUrlUpdating = isUpdatingKey(`stt_base_url:${selectedProviderId}`);
  const isApiKeyUpdating = isUpdatingKey(`stt_api_key:${selectedProviderId}`);
  const isModelUpdating = isUpdatingKey(`stt_model:${selectedProviderId}`);

  const isCustomProvider = selectedProvider?.id === "custom";

  return {
    providerOptions,
    selectedProviderId,
    selectedProvider,
    isCustomProvider,
    baseUrl,
    handleBaseUrlChange,
    isBaseUrlUpdating,
    apiKey,
    handleApiKeyChange,
    isApiKeyUpdating,
    model,
    handleModelChange,
    isModelUpdating,
    handleProviderSelect,
  };
};
