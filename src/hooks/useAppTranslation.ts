import i18n from "@/i18n/config";
import { useLanguage } from "@/i18n/LanguageContext";

export const useAppTranslation = () => {
  const { language } = useLanguage();
  
  // Simple function that uses current i18n instance
  const t = (key: string, options?: Record<string, unknown>) => {
    return i18n.t(key, options);
  };

  // Return plain object - no memoization needed
  return { t, language };
};
