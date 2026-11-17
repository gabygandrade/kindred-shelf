/** Card for creating a single-use invite link to share with a friend. */
import { useState } from "react";
import { errorMessage } from "../../../api/errorMessage";
import { Button } from "../../../components/Button";
import { TextField } from "../../../components/TextField";
import { useCreateFriendInvite } from "../hooks/useFriendMutations";
import styles from "./Friends.module.css";

/** A single-use link (7 days) for someone you know, instead of typing a username. */
export function InviteLinkCard() {
  const create = useCreateFriendInvite();
  const [copied, setCopied] = useState(false);

  return (
    <section className={styles.section} aria-labelledby="invite-link-heading">
      <h2 id="invite-link-heading" className={styles.heading}>
        Invite link
      </h2>
      <p className={styles.muted}>Send a friend a link. It works once and expires after 7 days.</p>
      {create.data ? (
        <div className={styles.form}>
          <TextField
            className={styles.field}
            label="Your invite link"
            value={create.data.url}
            readOnly
            onFocus={(event) => {
              event.currentTarget.select();
            }}
          />
          <Button
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(create.data.url).then(() => {
                setCopied(true);
              });
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      ) : (
        <div>
          <Button
            variant="secondary"
            disabled={create.isPending}
            onClick={() => {
              create.mutate();
            }}
          >
            Create an invite link
          </Button>
        </div>
      )}
      {create.error && (
        <p role="alert" className={styles.error}>
          {errorMessage(create.error)}
        </p>
      )}
    </section>
  );
}
