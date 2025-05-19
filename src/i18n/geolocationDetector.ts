import type { Detector } from "i18next-browser-languagedetector";

// Custom asynchronous detector that attempts to determine the user’s
// preferred language from their IP-based geolocation (via ipapi.co).
//
// It respects the Detector interface required by
// `i18next-browser-languagedetector` – namely `name`, `lookup`, `cacheUserLanguage`,
// and an `async` flag to signal that `lookup` returns a Promise.
//
// The service response includes a `languages` string like
// "en-US,es-US". We grab the first entry which is usually the most
// accurate language + region code in BCP-47 format.
//
// If the service fails or the data is missing we resolve with
// `undefined` allowing i18next to fall through to the next detector in
// the configured order.
export const geolocationDetector: Detector = {
  name: "geoip",
  lookup: async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) return undefined;
      const data: Record<string, any> = await res.json();

      // ipapi returns comma-separated language list (e.g. "en-US,es-US")
      // Pick the first value if present, otherwise map country_code to a
      // basic language assumption.
      const langList: string | undefined = data.languages;
      if (langList) {
        return langList.split(",")[0]?.trim();
      }

      // Fallback: derive simple mapping from country code.
      const country = (data.country_code || "").toUpperCase();
      switch (country) {
        case "ES":
          return "es-ES";
        case "FR":
          return "fr-FR";
        case "US":
        case "GB":
        default:
          return "en-US";
      }
    } catch (err) {
      // Silently ignore – let the detector chain continue.
      console.error("[i18n] geoip detector failed", err);
      return undefined;
    }
  },
  cacheUserLanguage: () => {
    /* We delegate caching to the main language detector’s localStorage */
  },
  async: true,
};
