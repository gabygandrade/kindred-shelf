/** The page for one of my books (/books/:olKey), where I can change its shelf, rating and privacy. */
import { useParams } from "react-router";
import { ButtonLink } from "../../../components/Button";
import { EmptyState, ErrorState, LoadingState } from "../../../components/QueryStates";
import { useMyBooks } from "../../shelf/hooks/useMyBooks";
import { shelfLabel } from "../../shelf/shelfLabels";
import { BookLayout } from "./BookLayout";
import { MyBookControls } from "./MyBookControls";

/** One of my books, opened from its spine. */
export function BookPage() {
  const { olKey = "" } = useParams();
  const { data: books, isPending, error, refetch } = useMyBooks();
  const book = books?.find((b) => b.work.olKey === olKey);
  const back = book
    ? { to: `/shelf/${book.shelf}`, label: `Back to ${shelfLabel[book.shelf]}` }
    : { to: "/", label: "Back to your shelves" };

  return (
    <BookLayout back={back} work={book?.work}>
      {isPending ? (
        <LoadingState label="Opening the book…" />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : book ? (
        <MyBookControls book={book} />
      ) : (
        <EmptyState
          headingLevel="h2"
          title="This book isn't on your shelves"
          actions={<ButtonLink to="/search">Find a book</ButtonLink>}
        />
      )}
    </BookLayout>
  );
}
