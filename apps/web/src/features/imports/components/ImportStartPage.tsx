/** The Goodreads import page (/welcome/import): how to export from Goodreads, and the upload. */
import { MAX_IMPORT_BYTES } from "@kindred/shared";
import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { errorMessage } from "../../../api/errorMessage";
import { Button, ButtonLink } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { useCreateImport } from "../hooks/useImportMutations";
import styles from "./Imports.module.css";

/** First onboarding step after sign-up, and also reachable from Settings. Skipping is always allowed. */
export function ImportStartPage() {
  const navigate = useNavigate();
  const createImport = useCreateImport();
  const [fileError, setFileError] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("file");
    if (!(file instanceof Blob) || file.size === 0) {
      setFileError("Choose your Goodreads export file first.");
      return;
    }
    if (file.size > MAX_IMPORT_BYTES) {
      setFileError("That file is larger than 5 MB. Is it the Goodreads library export?");
      return;
    }
    setFileError(null);
    createImport.mutate(file, { onSuccess: (jobId) => void navigate(`/imports/${jobId}`) });
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Bring your books with you"
        subtitle="Import your Goodreads history: your shelves, ratings and dates come along."
      />
      <section aria-labelledby="export-steps">
        <h2 id="export-steps">Get your Goodreads export</h2>
        <ol className={styles.steps}>
          <li>
            On goodreads.com, open <strong>My Books</strong>, then{" "}
            <strong>Import and export</strong>.
          </li>
          <li>
            Choose <strong>Export Library</strong> and wait for the link to appear.
          </li>
          <li>Download the CSV file, then upload it below.</li>
        </ol>
      </section>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="goodreads-file" className={styles.label}>
            Goodreads export (CSV, up to 5 MB)
          </label>
          <input
            id="goodreads-file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            className={styles.fileInput}
            aria-describedby={fileError ? "goodreads-file-error" : undefined}
          />
        </div>
        {(fileError ?? createImport.error) && (
          <p id="goodreads-file-error" role="alert" className={styles.error}>
            {fileError ?? errorMessage(createImport.error)}
          </p>
        )}
        <div className={styles.actions}>
          <Button type="submit" disabled={createImport.isPending}>
            {createImport.isPending ? "Uploading…" : "Import my books"}
          </Button>
          <ButtonLink to="/shelf/read" variant="ghost">
            Skip for now
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
