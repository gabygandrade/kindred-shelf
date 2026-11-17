/** A book's cover: the Open Library image, or a generated cover in the book's spine color. */
import type { Work } from "@kindred/shared";
import { useState } from "react";
import { spineStyle } from "../../shelf/spineStyle";
import { authorLine } from "../../shelf/components/Spine";
import { coverUrl } from "../coverUrl";
import styles from "./BookCover.module.css";

interface BookCoverProps {
  work: Pick<Work, "olKey" | "title" | "authors" | "coverId" | "pageCount">;
  size?: "large" | "small";
}

/** The real Open Library cover, or a generated one in the book's spine color. Never a blank. */
export function BookCover({ work, size = "large" }: BookCoverProps) {
  const [failedCoverId, setFailedCoverId] = useState<number | null>(null);
  const sizeClass = size === "small" ? styles.small : "";

  if (work.coverId && failedCoverId !== work.coverId) {
    return (
      <img
        className={`${styles.cover} ${sizeClass}`}
        src={coverUrl(work.coverId, size === "small" ? "S" : "M")}
        alt={`Cover of ${work.title}`}
        loading="lazy"
        onError={() => {
          setFailedCoverId(work.coverId);
        }}
      />
    );
  }

  const look = spineStyle(work, null);
  return (
    <div
      role="img"
      aria-label={`Cover of ${work.title}`}
      className={`${styles.cover} ${styles.generated} ${sizeClass}`}
      style={{ background: look.background, color: look.ink }}
    >
      <span className={styles.generatedTitle}>{work.title}</span>
      <span className={styles.generatedAuthor}>{authorLine(work)}</span>
    </div>
  );
}
