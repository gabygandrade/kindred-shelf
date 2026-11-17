/** Starts the mock API in the browser during development. */
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/** Starts Mock Service Worker in the browser (dev only; see main.tsx). */
export async function startMockApi(): Promise<void> {
  const worker = setupWorker(...handlers);
  // Let everything that isn't an API call (Vite modules, fonts, cover images) through.
  await worker.start({ onUnhandledFrame: "bypass", quiet: true });
}
