/** Where the API lives. One setting, so stage 3 can point the app at the real API. */
/**
 * Where the API lives. The app and API share one site (see "One site for app
 * and API" in the technical design), so a relative "/api" works in dev (MSW)
 * and behind a proxy in production; VITE_API_URL overrides it.
 */
export const API_BASE: string = import.meta.env.VITE_API_URL ?? "/api";
