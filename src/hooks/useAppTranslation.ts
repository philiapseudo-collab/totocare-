import { useCallback, useMemo } from "react";
import i18n from "@/i18n/config";
import { useLanguage } from "@/i18n/LanguageContext";

export const useAppTranslation = () => {
  const { language } = useLanguage();
  
  // Stable translation function that doesn't change on every render
  const t = useCallback((key: string, options?: Record<string, unknown>) => {
    return i18n.t(key, options);
  }, []); // Remove language dependency to prevent infinite loops

  // Return memoized object to prevent reference changes
  return useMemo(() => ({ t, language }), [t, language]);
};
