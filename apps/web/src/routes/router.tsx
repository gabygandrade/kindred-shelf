/**
 * Every route in the web app and the page each one renders. Signed-in pages sit
 * behind RequireSession, and most of them inside the AppShell layout.
 */
import { createBrowserRouter, Navigate, type RouteObject } from "react-router";
import { AppShell } from "../components/AppShell";
import { RequireSession } from "../features/auth/components/RequireSession";
import { SignInPage } from "../features/auth/components/SignInPage";
import { SignUpPage } from "../features/auth/components/SignUpPage";
import { BookPage } from "../features/book/components/BookPage";
import { ImportStartPage } from "../features/imports/components/ImportStartPage";
import { SearchPage } from "../features/search/components/SearchPage";
import { MyShelfPage } from "../features/shelf/components/MyShelfPage";

/** Every screen. Tests render these same routes in a memory router. */
export const routes: RouteObject[] = [
  { path: "/sign-in", element: <SignInPage /> },
  { path: "/sign-up", element: <SignUpPage /> },
  {
    element: <RequireSession />,
    children: [
      // The open-book view has its own top bar instead of the sidebar.
      { path: "/books/:olKey", element: <BookPage /> },
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/shelf/read" replace /> },
          { path: "/shelf/:shelf", element: <MyShelfPage /> },
          { path: "/search", element: <SearchPage /> },
          { path: "/welcome/import", element: <ImportStartPage /> },
          { path: "*", element: <Navigate to="/shelf/read" replace /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
