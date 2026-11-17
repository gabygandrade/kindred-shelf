/** A shelf of spines that wraps onto as many planks as the screen needs. */
import type { Work } from "@kindred/shared";
import { useMemo } from "react";
import { spineStyles } from "../spineStyle";
import styles from "./Bookshelf.module.css";
import { Spine } from "./Spine";

interface BookshelfProps {
  books: { work: Work }[];
  /** Accessible name for the list, e.g. "Read shelf". */
  label: string;
  hrefFor: (olKey: string) => string;
}

export function Bookshelf({ books, label, hrefFor }: BookshelfProps) {
  const looks = useMemo(() => spineStyles(books.map((b) => b.work)), [books]);
  return (
    <ul className={styles.shelf} aria-label={label}>
      {books.map(({ work }, i) => {
        const look = looks[i];
        if (!look) return null;
        return (
          <li key={work.olKey} className={styles.slot}>
            <Spine work={work} look={look} to={hrefFor(work.olKey)} />
          </li>
        );
      })}
    </ul>
  );
}
