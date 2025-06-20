import "./i18n";
import React from "react";
import { isWeb } from "@/utils/platform";
import App from "./App.tsx";

/* -------------------------------------------------------------------------- */
/*                                   Web only                                 */
/* -------------------------------------------------------------------------- */
if (isWeb()) {
  (async () => {
    // Load web-only modules lazily so they aren’t bundled for native.
    await import("./index.css");

    const [{ createRoot }, Sentry, reactRouterDom] = await Promise.all([
      import("react-dom/client"),
      import("@sentry/react"),
      import("react-router-dom"),
    ]);

    const {
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    } = reactRouterDom;

    Sentry.init({
      dsn: "https://f0b39040299b245a914fdd95a6425c8b@o4504148959756288.ingest.us.sentry.io/4509333190148096",
      release: import.meta.env?.VERCEL_GIT_COMMIT_SHA ?? undefined,
      environment: import.meta.env?.VERCEL_ENV ?? "development",
      enabled: import.meta.env?.VERCEL_ENV !== "development",
      integrations: [
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect: React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        }),
      ],
      sendDefaultPii: true,
      tracesSampleRate: 1.0,
    });

    const rootEl = document.getElementById("root");
    if (rootEl) {
      createRoot(rootEl).render(<App />);
    }
  })();
}

// Native apps register `App` with `AppRegistry`.
export default App;
// The rest of the file remains unchanged.
