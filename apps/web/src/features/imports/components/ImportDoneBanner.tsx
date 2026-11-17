/** Banner on the shelf after an import finishes, with its counts and a link to fix leftover rows. */
import { Link } from "react-router";
import { bookCount } from "../../shelf/shelfLabels";
import { useImportJob } from "../hooks/useImportJob";
import styles from "./Imports.module.css";

/** Shown on the bookshelf after an import lands there, pointing at any rows still to fix. */
export function ImportDoneBanner({ jobId }: { jobId: string }) {
  const { data: job } = useImportJob(jobId, { poll: false });
  if (job?.status !== "done") return null;
  return (
    <div role="status" className={styles.banner}>
      <p>Imported {bookCount(job.matched)} from Goodreads.</p>
      {job.unmatched > 0 && (
        <p>
          {job.unmatched === 1 ? "1 book" : `${job.unmatched} books`} couldn't be matched.{" "}
          <Link to={`/imports/${jobId}`}>Fix them</Link>
        </p>
      )}
    </div>
  );
}
