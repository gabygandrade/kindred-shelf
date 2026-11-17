import react from "@vitejs/plugin-react";
import { msw } from "msw/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Serves /mockServiceWorker.js in dev only, so the mock worker never ships
    // in a production build. "worker-only": we start it ourselves (src/mocks/browser.ts).
    command === "serve" && msw({ mode: "worker-only" }),
  ],
}));
