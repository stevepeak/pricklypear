import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const GEO_DETECTOR = {
  name: "geoDetector",
  lookup: async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) return undefined;
      const data = await res.json();
      // Map country/language to supported locales
      switch (data.country_code) {
        case "ES":
          return "es-ES";
        case "FR":
          return "fr-FR";
        default:
          return "en-US";
      }
    } catch {
      return undefined;
    }
  },
  cacheUserLanguage: () => {},
};

const supportedLngs = ["en-US", "es-ES", "fr-FR"];

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs,
    fallbackLng: "en-US",
    detection: {
      order: ["localStorage", "navigator", "geoDetector"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      detectors: [GEO_DETECTOR],
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    debug: false,
  });

export default i18n;
