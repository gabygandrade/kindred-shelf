/** Form for sending a friend request by username. */
import { sendFriendRequestBodySchema } from "@kindred/shared";
import { useState, type SubmitEvent } from "react";
import { isApiError } from "../../../api/client";
import { errorMessage } from "../../../api/errorMessage";
import { Button } from "../../../components/Button";
import { TextField } from "../../../components/TextField";
import { useSendFriendRequest } from "../hooks/useFriendMutations";
import styles from "./Friends.module.css";

export function AddFriendForm() {
  const send = useSendFriendRequest();
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = sendFriendRequestBodySchema.safeParse({
      username: new FormData(form).get("username"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a username");
      return;
    }
    setError(null);
    send.mutate(parsed.data.username, {
      onSuccess: (request) => {
        setSentTo(request.user.displayName);
        form.reset();
      },
      onError: (e) => {
        setSentTo(null);
        setError(isApiError(e, "not_found") ? "No member has that username." : errorMessage(e));
      },
    });
  }

  return (
    <section className={styles.section} aria-labelledby="add-friend-heading">
      <h2 id="add-friend-heading" className={styles.heading}>
        Add a friend
      </h2>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          className={styles.field}
          label="Their username"
          name="username"
          autoCapitalize="none"
          autoComplete="off"
          error={error ?? undefined}
        />
        <Button type="submit" disabled={send.isPending}>
          Send request
        </Button>
      </form>
      {sentTo && (
        <p role="status" className={styles.success}>
          Request sent to {sentTo}. You'll see each other's shelves once they accept.
        </p>
      )}
    </section>
  );
}
