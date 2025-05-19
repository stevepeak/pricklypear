import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { geolocationDetector } from "./geolocationDetector";

// Static (placeholder) locale resources – will be filled in later.
// We import synchronously for now; once real translations are added
// these can be code-split with i18next-http-backend.
import enUSCommon from "./locales/en-US/common.json";
import esESCommon from "./locales/es-ES/common.json";
import frFRCommon from "./locales/fr-FR/common.json";

export const SUPPORTED_LOCALES = ["en-US", "es-ES", "fr-FR"] as const;

// Construct resources object expected by i18next.
const resources = {
  "en-US": { common: enUSCommon },
  "es-ES": { common: esESCommon },
  "fr-FR": { common: frFRCommon },
} as const;

// Configure the primary detector and inject our custom geoip detector.
const primaryDetector = new LanguageDetector();
primaryDetector.addDetector(geolocationDetector);

void i18n
  .use(primaryDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Default locale
    fallbackLng: "en-US",
    // Namespace config – we start with a single "common" ns for the entire app.
    ns: ["common"],
    defaultNS: "common",

    // Detection order: stored preference → geoip → browser navigator → html lang.
    detection: {
      order: ["localStorage", "geoip", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already escapes.
    },

    // React-i18next options
    react: {
      useSuspense: false,
    },
  });

export default i18n;
