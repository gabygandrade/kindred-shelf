/// <reference types="vite/client" />

/** Types for the Vite environment variables the web app reads (import.meta.env). */
interface ImportMetaEnv {
  /** Optional API origin; defaults to "/api" on the app's own site. */
  readonly VITE_API_URL?: string;
  /** "false" turns the MSW mock API off in dev (stage 3 does this per area). */
  readonly VITE_MOCK_API?: string;
}
