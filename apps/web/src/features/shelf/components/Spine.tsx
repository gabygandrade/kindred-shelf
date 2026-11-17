/** One book spine on the shelf, as a link to the book. */
import type { Work } from "@kindred/shared";
import { Link } from "react-router";
import type { SpineStyle } from "../spineStyle";
import styles from "./Spine.module.css";

export function authorLine(work: Pick<Work, "authors">): string {
  return work.authors.join(", ") || "Unknown author";
}

function lastName(author: string | undefined): string {
  return author?.trim().split(/\s+/).at(-1) ?? "";
}

interface SpineProps {
  work: Work;
  look: SpineStyle;
  to: string;
}

/** One book on the shelf: a link whose accessible name is "Title by Author". */
export function Spine({ work, look, to }: SpineProps) {
  return (
    <Link
      to={to}
      className={styles.spine}
      aria-label={`${work.title} by ${authorLine(work)}`}
      style={{
        width: look.width,
        height: look.height,
        background: look.background,
        color: look.ink,
      }}
    >
      <span className={styles.title} aria-hidden="true">
        {work.title}
      </span>
      <span className={styles.author} aria-hidden="true">
        {lastName(work.authors[0])}
      </span>
    </Link>
  );
}
