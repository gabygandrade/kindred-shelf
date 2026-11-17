/**
 * One search result: cover, title and author, with buttons to add it to a
 * shelf, or a link to my copy if it's already on one.
 */
import type { BookSearchResult, MyBook, Shelf } from "@kindred/shared";
import { useState } from "react";
import { Link } from "react-router";
import { errorMessage } from "../../../api/errorMessage";
import { Button } from "../../../components/Button";
import { BookCover } from "../../book/components/BookCover";
import { StarRating } from "../../book/components/StarRating";
import { authorLine } from "../../shelf/components/Spine";
import { usePutMyBook } from "../../shelf/hooks/useMyBookMutations";
import { shelfLabel } from "../../shelf/shelfLabels";
import styles from "./SearchResultItem.module.css";

const ADD_ORDER: Shelf[] = ["want", "reading", "read"];

interface SearchResultItemProps {
  result: BookSearchResult;
  /** My copy, if this book is already on one of my shelves. */
  current: MyBook | undefined;
}

export function SearchResultItem({ result, current }: SearchResultItemProps) {
  const put = usePutMyBook();
  // After adding as Read, offer a rating once (skippable, PRD P0-2).
  const [ratingPromptOpen, setRatingPromptOpen] = useState(false);
  const meta = [authorLine(result), result.firstPublishYear].filter(Boolean).join(" · ");

  function add(shelf: Shelf) {
    put.mutate(
      { olKey: result.olKey, body: { shelf } },
      {
        onSuccess: () => {
          setRatingPromptOpen(shelf === "read");
        },
      },
    );
  }

  return (
    <li className={styles.item}>
      <div className={styles.cover}>
        <BookCover work={{ ...result }} size="small" />
      </div>
      <div className={styles.info}>
        <h2 className={styles.title}>{result.title}</h2>
        <p className={styles.meta}>{meta}</p>
      </div>
      <div className={styles.actions}>
        {current && ratingPromptOpen ? (
          <>
            <span className={styles.status}>Added to Read. How was it?</span>
            <StarRating
              label={`Rate ${result.title}`}
              value={current.rating}
              disabled={put.isPending}
              onChange={(rating) => {
                put.mutate({ olKey: result.olKey, body: { shelf: "read", rating } });
              }}
            />
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                setRatingPromptOpen(false);
              }}
            >
              {current.rating ? "Done" : "Skip"}
            </Button>
          </>
        ) : current ? (
          <Link to={`/books/${result.olKey}`} className={styles.status}>
            On your {shelfLabel[current.shelf]} shelf
          </Link>
        ) : (
          <div
            role="group"
            aria-label={`Add ${result.title} to a shelf`}
            className={styles.actions}
          >
            {ADD_ORDER.map((shelf) => (
              <Button
                key={shelf}
                variant={shelf === "want" ? "primary" : "secondary"}
                size="small"
                disabled={put.isPending}
                onClick={() => {
                  add(shelf);
                }}
              >
                {shelfLabel[shelf]}
              </Button>
            ))}
          </div>
        )}
      </div>
      {put.error && (
        <p role="alert" className={styles.error}>
          {errorMessage(put.error)}
        </p>
      )}
    </li>
  );
}
