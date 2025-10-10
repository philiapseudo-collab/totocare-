import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "journal": "Journal",
        "vaccinations": "Vaccinations",
        "conditions": "Conditions",
        "medications": "Medications",
        "upcoming": "Upcoming",
        "checklist": "Checklist",
        "guides": "Guides",
        "support": "Support",
        "donate": "Donate",
        "profile": "Profile",
        "logout": "Logout",
        "about": "About",
        "faq": "FAQ"
      },
      "common": {
        "add": "Add",
        "edit": "Edit",
        "delete": "Delete",
        "save": "Save",
        "cancel": "Cancel",
        "search": "Search",
        "export": "Export",
        "loading": "Loading...",
        "noData": "No data available",
        "welcome": "Welcome",
        "viewAll": "View All"
      },
      "dashboard": {
        "title": "Dashboard",
        "quickActions": "Quick Actions",
        "recentActivity": "Recent Activity",
        "upcomingEvents": "Upcoming Events",
        "healthAnalytics": "Health Analytics",
        "aiInsights": "AI Insights",
        "keyMetrics": "Key Metrics",
        "todaysChecklist": "Today's Checklist",
        "dueDateCountdown": "Due Date Countdown"
      },
      "donation": {
        "title": "Support Maternal Care",
        "description": "Help mothers and babies access quality healthcare",
        "button": "Donate Now"
      },
      "medication": {
        "title": "Medication Reminders",
        "description": "Never miss your medication schedule",
        "button": "View Medications",
        "addMedication": "Add Medication"
      },
      "auth": {
        "login": "Login",
        "signup": "Sign Up",
        "email": "Email",
        "password": "Password",
        "forgotPassword": "Forgot Password?"
      }
    }
  },
  sw: {
    translation: {
      "nav": {
        "dashboard": "Dashibodi",
        "journal": "Jarida",
        "vaccinations": "Chanjo",
        "conditions": "Hali za Afya",
        "medications": "Dawa",
        "upcoming": "Inayokuja",
        "checklist": "Orodha ya Ukaguzi",
        "guides": "Mwongozo",
        "support": "Msaada",
        "donate": "Changia",
        "profile": "Wasifu",
        "logout": "Toka",
        "about": "Kuhusu",
        "faq": "Maswali Yanayoulizwa Mara kwa Mara"
      },
      "common": {
        "add": "Ongeza",
        "edit": "Hariri",
        "delete": "Futa",
        "save": "Hifadhi",
        "cancel": "Ghairi",
        "search": "Tafuta",
        "export": "Hamisha",
        "loading": "Inapakia...",
        "noData": "Hakuna data inayopatikana",
        "welcome": "Karibu",
        "viewAll": "Angalia Yote"
      },
      "dashboard": {
        "title": "Dashibodi",
        "quickActions": "Vitendo vya Haraka",
        "recentActivity": "Shughuli za Hivi Karibuni",
        "upcomingEvents": "Matukio Yanayokuja",
        "healthAnalytics": "Uchanganuzi wa Afya",
        "aiInsights": "Maarifa ya AI",
        "keyMetrics": "Vipimo Muhimu",
        "todaysChecklist": "Orodha ya Leo",
        "dueDateCountdown": "Hesabu ya Tarehe ya Kujifungua"
      },
      "donation": {
        "title": "Unga Mkono Huduma ya Mama na Mtoto",
        "description": "Saidia wamama na watoto kupata huduma bora za afya",
        "button": "Changia Sasa"
      },
      "medication": {
        "title": "Vikumbusho vya Dawa",
        "description": "Usisahau ratiba yako ya dawa",
        "button": "Angalia Dawa",
        "addMedication": "Ongeza Dawa"
      },
      "auth": {
        "login": "Ingia",
        "signup": "Jisajili",
        "email": "Barua Pepe",
        "password": "Nywila",
        "forgotPassword": "Umesahau Nywila?"
      }
    }
  }
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
