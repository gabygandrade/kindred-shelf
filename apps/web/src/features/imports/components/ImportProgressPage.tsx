/** The import job page (/imports/:id): progress while it runs, then the rows that need fixing. */
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { ButtonLink } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { ErrorState, LoadingState } from "../../../components/QueryStates";
import { useImportJob } from "../hooks/useImportJob";
import styles from "./Imports.module.css";
import { UnmatchedRows } from "./UnmatchedRows";

export function ImportProgressPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: job, error, refetch } = useImportJob(id);
  // Only jump to the shelf if we watched the job finish. Opening a finished
  // job (from "Fix them") stays here to show the rows to fix.
  const sawRunning = useRef(false);

  useEffect(() => {
    if (job?.status === "queued" || job?.status === "running") sawRunning.current = true;
    if (job?.status === "done" && sawRunning.current) {
      void navigate(`/shelf/read?import=${id}`, { replace: true });
    }
  }, [job?.status, id, navigate]);

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!job) return <LoadingState label="Starting your import…" />;

  if (job.status === "failed") {
    return (
      <div className={styles.page}>
        <PageHeader title="The import stopped" />
        <p className={styles.muted}>
          Something went wrong while matching your books. Nothing on your shelves changed.
        </p>
        <div className={styles.actions}>
          <ButtonLink to="/welcome/import">Try again</ButtonLink>
          <ButtonLink to="/shelf/read" variant="ghost">
            Go to my shelves
          </ButtonLink>
        </div>
      </div>
    );
  }

  const processed = job.matched + job.unmatched;
  if (job.status !== "done") {
    return (
      <div className={styles.page}>
        <PageHeader
          title="Matching your books"
          subtitle="This can take a minute for a big library."
        />
        <div>
          <label htmlFor="import-progress" className={styles.label}>
            {processed} of {job.total} books checked
          </label>
          <progress
            id="import-progress"
            className={styles.progress}
            value={processed}
            max={job.total}
          />
        </div>
        <p className={styles.muted} aria-live="polite">
          {job.matched} matched so far
        </p>
      </div>
    );
  }

  const toFix = job.rows.filter((r) => r.status === "unmatched").length;
  return (
    <div className={styles.page}>
      <PageHeader
        title={toFix > 0 ? "A few books need you" : "All matched"}
        subtitle={`${job.matched} of ${job.total} books matched automatically.`}
        actions={<ButtonLink to="/shelf/read">Go to my bookshelf</ButtonLink>}
      />
      {job.rows.length > 0 && <UnmatchedRows jobId={job.id} rows={job.rows} />}
    </div>
  );
}
