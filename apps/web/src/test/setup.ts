/** Runs before every web test: adds DOM matchers, starts the mock API, and resets it between tests. */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";
import { resetDb } from "../mocks/db";
import { handlers } from "../mocks/handlers";

// Tests run against the same MSW handlers as the dev app, so components are
// tested with real fetchers, real query hooks and contract-checked responses.
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
});

afterAll(() => {
  server.close();
});
