/** Hooks for signing in, signing up and signing out, keeping the cached session in sync. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys, signIn, signOut, signUp } from "../api";

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signIn,
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session, session);
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signUp,
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session, session);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Drop every cached response so the next member never sees this one's data.
      queryClient.clear();
      queryClient.setQueryData(authKeys.session, { user: null });
    },
  });
}
