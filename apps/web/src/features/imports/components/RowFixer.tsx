/** Search for the right book and attach it to one unmatched import row. */
import type { ImportRow } from "@kindred/shared";
import { useState } from "react";
import { errorMessage } from "../../../api/errorMessage";
import { Button } from "../../../components/Button";
import { ErrorState, LoadingState } from "../../../components/QueryStates";
import { TextField } from "../../../components/TextField";
import { useBookSearch } from "../../search/hooks/useBookSearch";
import { authorLine } from "../../shelf/components/Spine";
import { useFixImportRow } from "../hooks/useImportMutations";
import styles from "./UnmatchedRows.module.css";

/** A starting search: the title without "(Kindle Edition)" or a subtitle. */
function suggestedQuery(row: ImportRow): string {
  return (
    row.title
      .replace(/\(.*?\)/g, "")
      .split(":")[0]
      ?.trim() ?? row.title
  );
}

/** Search for the right work and attach it to one unmatched row. */
export function RowFixer({ jobId, row }: { jobId: string; row: ImportRow }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(() => suggestedQuery(row));
  const [submitted, setSubmitted] = useState("");
  const search = useBookSearch(submitted);
  const fix = useFixImportRow(jobId);

  if (!open) {
    return (
      <div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => {
            setOpen(true);
            setSubmitted(q);
          }}
        >
          Find the right book
        </Button>
      </div>
    );
  }

  return (
    <>
      <form
        className={styles.search}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(q.trim());
        }}
      >
        <TextField
          className={styles.searchField}
          label={`Search for "${row.title}"`}
          type="search"
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
          }}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      {search.isPending && submitted ? (
        <LoadingState label="Searching…" />
      ) : search.error ? (
        <ErrorState error={search.error} onRetry={() => void search.refetch()} />
      ) : search.data?.length === 0 ? (
        <p className={styles.meta}>No matches. Try a shorter title or the author's last name.</p>
      ) : (
        <ul className={styles.candidates} aria-label={`Matches for ${row.title}`}>
          {search.data?.map((result) => (
            <li key={result.olKey} className={styles.candidate}>
              <span>
                {result.title}{" "}
                <span className={styles.meta}>
                  · {[authorLine(result), result.firstPublishYear].filter(Boolean).join(" · ")}
                </span>
              </span>
              <Button
                size="small"
                disabled={fix.isPending}
                aria-label={`Use ${result.title} by ${authorLine(result)}`}
                onClick={() => {
                  fix.mutate({ rowNumber: row.rowNumber, olKey: result.olKey });
                }}
              >
                Use this book
              </Button>
            </li>
          ))}
        </ul>
      )}
      {fix.error && (
        <p role="alert" className={styles.error}>
          {errorMessage(fix.error)}
        </p>
      )}
    </>
  );
}
