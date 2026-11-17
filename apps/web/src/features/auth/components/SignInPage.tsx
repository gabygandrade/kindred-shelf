/** The sign-in page. After signing in it returns you to the page you came from. */
import { signInBodySchema } from "@kindred/shared";
import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { errorMessage } from "../../../api/errorMessage";
import { Button } from "../../../components/Button";
import { fieldErrors } from "../../../components/fieldErrors";
import { TextField } from "../../../components/TextField";
import { useSignIn } from "../hooks/useAuthMutations";
import { useSession } from "../hooks/useSession";
import { AuthLayout, authStyles } from "./AuthLayout";
import { safeNextPath } from "./safeNextPath";

export function SignInPage() {
  const [params] = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const { user } = useSession();
  const signIn = useSignIn();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user) return <Navigate to={next} replace />;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = signInBodySchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    signIn.mutate(parsed.data);
  }

  return (
    <AuthLayout title="Welcome back">
      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          error={errors.password}
        />
        {signIn.error && (
          <p role="alert" className={authStyles.formError}>
            {errorMessage(signIn.error)}
          </p>
        )}
        <Button type="submit" disabled={signIn.isPending}>
          {signIn.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className={authStyles.footer}>
        Have an invite code? <Link to="/sign-up">Create your account</Link>
      </p>
    </AuthLayout>
  );
}
