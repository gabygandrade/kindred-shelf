/** The shared loading, error and empty states every data screen shows while it fetches. */
import type { ReactNode } from "react";
import { errorMessage } from "../api/errorMessage";
import { Button } from "./Button";
import styles from "./QueryStates.module.css";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <p role="status" className={styles.loading}>
      {label}
    </p>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className={styles.error}>
      <p className={styles.errorText}>{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="small" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  headingLevel?: "h2" | "h3";
}

export function EmptyState({ title, children, actions, headingLevel = "h2" }: EmptyStateProps) {
  const Heading = headingLevel;
  return (
    <section className={styles.empty}>
      <Heading className={styles.emptyTitle}>{title}</Heading>
      {children && <p className={styles.emptyBody}>{children}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  );
}
