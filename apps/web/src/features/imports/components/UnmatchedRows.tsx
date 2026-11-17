/** The list of import rows that didn't match a book, each with a way to fix it. */
import type { ImportRow } from "@kindred/shared";
import { shelfLabel } from "../../shelf/shelfLabels";
import { RowFixer } from "./RowFixer";
import styles from "./UnmatchedRows.module.css";

/** Rows we couldn't match: listed for fixing, never silently dropped (PRD P0-3). */
export function UnmatchedRows({ jobId, rows }: { jobId: string; rows: ImportRow[] }) {
  return (
    <section aria-labelledby="unmatched-heading">
      <h2 id="unmatched-heading">Books we couldn't match</h2>
      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.rowNumber} className={styles.row}>
            <div className={styles.head}>
              <div>
                <h3 className={styles.title}>{row.title}</h3>
                <p className={styles.meta}>
                  {row.author} · {shelfLabel[row.shelf]} · row {row.rowNumber}
                </p>
              </div>
              {row.status === "fixed" && <span className={styles.fixed}>Fixed ✓</span>}
            </div>
            {row.status === "unmatched" && <RowFixer jobId={jobId} row={row} />}
          </li>
        ))}
      </ul>
    </section>
  );
}
