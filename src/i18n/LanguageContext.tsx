import React, { createContext, useCallback, useContext, useEffect, useState, PropsWithChildren } from "react";
import i18n from "./config";

export type Language = "en" | "sw";

type LanguageContextType = {
  language: Language;
  setLanguage: (lng: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = (localStorage.getItem("appLang") as Language) || (localStorage.getItem("i18nextLng") as Language);
    return stored === "en" || stored === "sw" ? stored : "en";
  });

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    localStorage.setItem("appLang", language);
  }, [language]);

  // Keep state in sync if language changes elsewhere
  useEffect(() => {
    const handler = (lng: string) => {
      const next = (lng === "sw" ? "sw" : "en") as Language;
      setLanguageState(next);
      localStorage.setItem("appLang", next);
    };
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  const setLanguage = useCallback((lng: Language) => {
    if (lng === language) return;
    const body = document.body;
    body.classList.add("language-transitioning");
    // Trigger reflow and animate
    requestAnimationFrame(() => {
      i18n.changeLanguage(lng).finally(() => {
        setLanguageState(lng);
        localStorage.setItem("appLang", lng);
        setTimeout(() => {
          body.classList.remove("language-transitioning");
        }, 200);
      });
    });
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
