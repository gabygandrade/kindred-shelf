/** Entry point of the web app: loads fonts and global styles, starts the mock API in dev, then renders the app. */
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/tokens.css";
import "./styles/global.css";

async function start() {
  // Dev uses the MSW mock API until stage 3; VITE_MOCK_API=false turns it off.
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API !== "false") {
    const { startMockApi } = await import("./mocks/browser");
    await startMockApi();
  }
  const root = document.getElementById("root");
  if (!root) throw new Error("Missing #root element in index.html");
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
