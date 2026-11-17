/** The read-only page for a book on a friend's shelf. */
import { useParams } from "react-router";
import { EmptyState, ErrorState, LoadingState } from "../../../components/QueryStates";
import { useUserShelf } from "../../shelf/hooks/useUserShelf";
import { shelfLabel } from "../../shelf/shelfLabels";
import { readingDates } from "../readingDates";
import { BookLayout } from "./BookLayout";
import styles from "./BookPage.module.css";
import { RatingDisplay } from "./StarRating";

/** A book on a friend's shelf: read-only. */
export function FriendBookPage() {
  const { username = "", olKey = "" } = useParams();
  const { data: shelf, isPending, error, refetch } = useUserShelf(username);
  const book = shelf?.books.find((b) => b.work.olKey === olKey);
  const name = shelf?.owner.displayName ?? username;
  const back = { to: `/friends/${username}`, label: `Back to ${name}'s shelf` };

  return (
    <BookLayout back={back} work={book?.work}>
      {isPending ? (
        <LoadingState label="Opening the book…" />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : book ? (
        <>
          <p className={styles.prompt}>
            On {name}'s {shelfLabel[book.shelf]} shelf
          </p>
          {book.rating !== null && <RatingDisplay value={book.rating} owner={name} />}
          {readingDates(book) && <p className={styles.muted}>{readingDates(book)}</p>}
        </>
      ) : (
        <EmptyState title="This book isn't on their shelves" />
      )}
    </BookLayout>
  );
}
