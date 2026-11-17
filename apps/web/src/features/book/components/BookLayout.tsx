/**
 * Layout of the open-book screen, shared by my books and friends' books: top bar,
 * cover panel and book details.
 */
import type { Work } from "@kindred/shared";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { OpenLibraryCredit } from "../../../components/OpenLibraryCredit";
import { authorLine } from "../../shelf/components/Spine";
import { openLibraryUrl } from "../coverUrl";
import { BookCover } from "./BookCover";
import styles from "./BookLayout.module.css";

interface BookLayoutProps {
  back: { to: string; label: string };
  work?: Work;
  children: ReactNode;
}

/** "Book data" line under the title: "Author · 1847 · 532 pages". */
function metaLine(work: Work): string {
  return [
    authorLine(work),
    work.firstPublishYear ?? undefined,
    work.pageCount ? `${work.pageCount} pages` : undefined,
  ]
    .filter((part) => part !== undefined)
    .join(" · ");
}

/** The open-book screen: cover panel on the left, details on the right (stacked on phones). */
export function BookLayout({ back, work, children }: BookLayoutProps) {
  return (
    <>
      <header className={styles.topBar}>
        <Link to={back.to} className={styles.back}>
          ← {back.label}
        </Link>
        <Link to="/" className={styles.logo}>
          Kindred Shelf
        </Link>
      </header>
      <main className={styles.main}>
        {work ? (
          <>
            <div className={styles.coverPanel}>
              <BookCover work={work} />
              <a href={openLibraryUrl(work.olKey)}>View on Open Library ↗</a>
            </div>
            <div className={styles.details}>
              <div>
                <h1 className={styles.title}>{work.title}</h1>
                <p className={styles.meta}>{metaLine(work)}</p>
              </div>
              {children}
            </div>
          </>
        ) : (
          children
        )}
      </main>
      <OpenLibraryCredit className={styles.footer} />
    </>
  );
}
