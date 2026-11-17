/** The invite-only sign-up page. A new member goes on to the Goodreads import step. */
import { signUpBodySchema } from "@kindred/shared";
import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { errorMessage } from "../../../api/errorMessage";
import { Button } from "../../../components/Button";
import { fieldErrors } from "../../../components/fieldErrors";
import { TextField } from "../../../components/TextField";
import { useSignUp } from "../hooks/useAuthMutations";
import { useSession } from "../hooks/useSession";
import { AuthLayout, authStyles } from "./AuthLayout";

export function SignUpPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const signUp = useSignUp();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user && !signUp.isSuccess) return <Navigate to="/" replace />;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = signUpBodySchema.safeParse({
      displayName: form.get("displayName"),
      username: form.get("username"),
      email: form.get("email"),
      password: form.get("password"),
      inviteCode: form.get("inviteCode") || undefined,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    // First onboarding step: bring in Goodreads history (or skip).
    signUp.mutate(parsed.data, { onSuccess: () => void navigate("/welcome/import") });
  }

  return (
    <AuthLayout title="Join Kindred Shelf" intro="Kindred Shelf is invite-only for now.">
      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Invite code"
          name="inviteCode"
          defaultValue={params.get("invite") ?? ""}
          autoComplete="off"
          error={errors.inviteCode}
        />
        <TextField
          label="Your name"
          name="displayName"
          autoComplete="name"
          error={errors.displayName}
        />
        <TextField
          label="Username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          hint="Friends find you by this. Lowercase letters, numbers and underscores."
          error={errors.username}
        />
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
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password}
        />
        {signUp.error && (
          <p role="alert" className={authStyles.formError}>
            {errorMessage(signUp.error)}
          </p>
        )}
        <Button type="submit" disabled={signUp.isPending}>
          {signUp.isPending ? "Creating your account…" : "Create account"}
        </Button>
      </form>
      <p className={authStyles.footer}>
        Already a member? <Link to="/sign-in">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
