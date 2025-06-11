import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const GEO_DETECTOR = {
  name: 'geoDetector',
  lookup(): string | string[] {
    return undefined;
  },
  cacheUserLanguage: () => {},
};

const supportedLngs = ['en-US', 'es-ES', 'fr-FR'];

const languageDetector = new LanguageDetector();
languageDetector.addDetector(GEO_DETECTOR);

i18n
  .use(HttpApi)
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs,
    fallbackLng: 'en-US',
    detection: {
      order: ['localStorage', 'navigator', 'geoDetector'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    debug: false,
  });
