/** The controls for editing my copy of a book: shelf, rating, privacy and remove. */
import type { MyBook, PutMyBookBody, Shelf } from "@kindred/shared";
import { useState } from "react";
import { useNavigate } from "react-router";
import { errorMessage } from "../../../api/errorMessage";
import { Button } from "../../../components/Button";
import { useDeleteMyBook, usePutMyBook } from "../../shelf/hooks/useMyBookMutations";
import { shelfLabel } from "../../shelf/shelfLabels";
import { readingDates } from "../readingDates";
import styles from "./BookPage.module.css";
import { ShelfPicker } from "./ShelfPicker";
import { StarRating } from "./StarRating";

/** Rating, shelf, privacy and removal for one of my books. */
export function MyBookControls({ book }: { book: MyBook }) {
  const navigate = useNavigate();
  const put = usePutMyBook();
  const remove = useDeleteMyBook();
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const olKey = book.work.olKey;
  const dates = readingDates(book);

  function save(body: Omit<PutMyBookBody, "shelf"> & { shelf?: Shelf }) {
    put.mutate({ olKey, body: { shelf: book.shelf, ...body } });
  }

  return (
    <>
      {book.shelf === "read" && (
        <div className={styles.ratingRow}>
          <StarRating
            value={book.rating}
            disabled={put.isPending}
            onChange={(rating) => {
              save({ rating });
            }}
          />
          {book.rating === null && (
            <p className={styles.prompt}>How was it? Rate it now, or skip and add it later.</p>
          )}
          {dates && <span className={styles.muted}>{dates}</span>}
        </div>
      )}
      {book.shelf !== "read" && dates && <p className={styles.muted}>{dates}</p>}

      <ShelfPicker
        value={book.shelf}
        disabled={put.isPending}
        onChange={(shelf) => {
          save({ shelf });
        }}
      />

      <label className={styles.private}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={book.isPrivate}
          disabled={put.isPending}
          onChange={(event) => {
            save({ isPrivate: event.target.checked });
          }}
        />
        Keep this book private
      </label>

      {put.error && (
        <p role="alert" className={styles.error}>
          {errorMessage(put.error)}
        </p>
      )}

      <div className={styles.remove}>
        {confirmingRemove ? (
          <>
            <span>Remove it from {shelfLabel[book.shelf]}?</span>
            <Button
              variant="danger"
              size="small"
              disabled={remove.isPending}
              onClick={() => {
                remove.mutate(olKey, { onSuccess: () => void navigate(`/shelf/${book.shelf}`) });
              }}
            >
              Yes, remove it
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                setConfirmingRemove(false);
              }}
            >
              Keep it
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              setConfirmingRemove(true);
            }}
          >
            Remove from my shelves
          </Button>
        )}
        {remove.error && (
          <p role="alert" className={styles.error}>
            {errorMessage(remove.error)}
          </p>
        )}
      </div>
    </>
  );
}
