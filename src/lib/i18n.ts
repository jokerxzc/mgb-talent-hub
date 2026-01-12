import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import enTranslation from "../../public/locales/en/translation.json";
import filTranslation from "../../public/locales/fil/translation.json";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      fil: {
        translation: filTranslation,
      },
    },
    lng: "en", // default language
    fallbackLng: "en", // fallback language if translation is not found
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;