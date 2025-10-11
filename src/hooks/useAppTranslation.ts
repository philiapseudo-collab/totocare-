import { useCallback } from "react";
import i18n from "@/i18n/config";
import { useLanguage } from "@/i18n/LanguageContext";

export const useAppTranslation = () => {
  const { language } = useLanguage();
  const t = useCallback((key: string, options?: Record<string, unknown>) => {
    return i18n.t(key, options);
  }, [language]);

  return { t, language } as const;
};
