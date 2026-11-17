/**
 * Entry point of the web app: loads fonts and global styles, starts the mock
 * API in dev, and renders the router inside TanStack Query's provider.
 */
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./routes/router";
import "./styles/tokens.css";
import "./styles/global.css";

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

void start();
