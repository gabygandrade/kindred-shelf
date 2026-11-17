/** Every route in the web app and the page each one renders. */
import { createBrowserRouter, type RouteObject } from "react-router";
import { SignInPage } from "../features/auth/components/SignInPage";
import { SignUpPage } from "../features/auth/components/SignUpPage";

/** Every screen. Tests render these same routes in a memory router. */
export const routes: RouteObject[] = [
  { path: "/sign-in", element: <SignInPage /> },
  { path: "/sign-up", element: <SignUpPage /> },
];

export const router = createBrowserRouter(routes);
