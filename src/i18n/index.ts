// Global i18n configuration ---------------------------------------------------
// This file centralises all `i18next` setup for the Prickly Pear web
// application. The singleton instance configured here is used implicitly by
// `react-i18next` hooks (e.g. `useTranslation`), so we only need to initialise
// it once.
//
// High-level flow:
// 1. Translations are lazy-loaded from `/locales/<lng>/<ns>.json` via
//    `i18next-http-backend`.
// 2. A chain of language detectors determines the user’s preferred locale in
//    this order:
//      a. `localStorage` (user-selected preference)
//      b. Browser/OS setting (`navigator.language`)
//      c. A custom (currently stubbed) Geo-IP detector
// 3. React integration is enabled through `initReactI18next`.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// -----------------------------------------------------------------------------
// Custom detectors
// -----------------------------------------------------------------------------

/**
 * Potential future Geo-IP language detector.
 *
 * The detector is registered so that we can progressively enhance localisation
 * based on the user’s geographic location without touching the rest of the
 * configuration. For now it purposely returns `undefined` so that i18next
 * continues to the next detector in the `order` array.
 */
const GEO_DETECTOR = {
  name: 'geoDetector',
  lookup(): string | string[] {
    // Returning `undefined` signals “no match”.
    return undefined;
  },
  // Required by the detector interface, but nothing to cache for Geo-IP.
  cacheUserLanguage: () => {},
};

// -----------------------------------------------------------------------------
// Static configuration
// -----------------------------------------------------------------------------

/**
 * Whitelist of locales that ship with full translation files.
 * If a user’s preferred language resolves to a locale not in this array,
 * i18next falls back to `fallbackLng`.
 */
const supportedLngs = ['en-US', 'es-ES', 'fr-FR'];

// Create a fresh detector instance so we can extend it before use.
const languageDetector = new LanguageDetector();
languageDetector.addDetector(GEO_DETECTOR);

// -----------------------------------------------------------------------------
// Initialisation
// -----------------------------------------------------------------------------

i18n
  // Backend: fetch translation JSON over HTTP
  .use(HttpApi)
  // Language detection chain
  .use(languageDetector)
  // React integration
  .use(initReactI18next)
  // Kick-off initialisation with detailed options
  .init({
    // Languages that are considered “valid” by the app
    supportedLngs,
    // Fallback when no detectors yield a supported language
    fallbackLng: 'en-US',
    detection: {
      // Sequence in which detectors are executed
      order: ['localStorage', 'navigator', 'geoDetector'],
      // Persist the chosen language in localStorage under the key below
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    backend: {
      // Path template for translation files
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // We currently use a single default namespace for simplicity
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      // React already performs XSS escaping
      escapeValue: false,
    },
    react: {
      // The app does not (yet) have a top-level Suspense boundary
      useSuspense: false,
    },
    // Toggle to `true` locally for verbose logging while working on i18n
    debug: false,
  });

// No explicit export is necessary because `react-i18next` keeps a reference to
// the singleton internally. Other modules can still import it directly if
// needed:
//
//   import i18n from '@/i18n';
