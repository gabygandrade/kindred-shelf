/** The Settings page: import from Goodreads, download your data, sign out, and delete your account. */
import { useState } from "react";
import { useNavigate } from "react-router";
import { errorMessage } from "../../../api/errorMessage";
import { Button, ButtonLink } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { createInvite } from "../../auth/api";
import { useSignOut } from "../../auth/hooks/useAuthMutations";
import styles from "../../friends/components/Friends.module.css";
import { deleteAccount, downloadExport } from "../api";

export function SettingsPage() {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function run(action: () => Promise<string | null>) {
    try {
      setMessage(await action());
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Settings" />
      <section className={styles.section} aria-label="Import and export">
        <div className={styles.actions}>
          <ButtonLink to="/welcome/import" variant="secondary">
            Import from Goodreads
          </ButtonLink>
          <Button
            variant="secondary"
            onClick={() =>
              void run(async () => {
                const url = URL.createObjectURL(await downloadExport());
                const link = Object.assign(document.createElement("a"), {
                  href: url,
                  download: "kindred-shelf-export.csv",
                });
                link.click();
                URL.revokeObjectURL(url);
                return "Export downloaded.";
              })
            }
          >
            Export my books (CSV)
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              void run(async () => `Sign-up invite code: ${(await createInvite()).code}`)
            }
          >
            Create a sign-up invite
          </Button>
        </div>
        {message && (
          <p role="status" className={styles.success}>
            {message}
          </p>
        )}
      </section>
      <section className={styles.section} aria-label="Account">
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => {
              signOut.mutate(undefined, { onSuccess: () => void navigate("/sign-in") });
            }}
          >
            Sign out
          </Button>
          {confirmDelete ? (
            <>
              <span className={styles.muted}>This deletes your account and every book on it.</span>
              <Button
                variant="danger"
                onClick={() =>
                  void run(async () => {
                    await deleteAccount();
                    window.location.assign("/sign-in");
                    return null;
                  })
                }
              >
                Delete forever
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setConfirmDelete(false);
                }}
              >
                Keep my account
              </Button>
            </>
          ) : (
            <Button
              variant="danger"
              onClick={() => {
                setConfirmDelete(true);
              }}
            >
              Delete my account
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
