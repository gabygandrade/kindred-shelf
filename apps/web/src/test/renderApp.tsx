/** Test helper that renders the real app at a URL, optionally signed in as a fixture member. */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { db, setSessionUserId } from "../mocks/db";
import { routes } from "../routes/router";

/**
 * Render the real app at `path`, talking to the MSW mock API.
 * `as` signs in a fixture member by username first.
 */
export function renderApp(path: string, { as }: { as?: string } = {}) {
  if (as) {
    const user = db.users.find((u) => u.username === as);
    if (!user) throw new Error(`No fixture member ${as}`);
    setSessionUserId(user.userId);
  }
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { user, router };
}
