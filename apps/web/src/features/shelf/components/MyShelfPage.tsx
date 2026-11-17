/** The home page (/shelf/:shelf): my books on one shelf, shown as spines. */
import { shelfSchema } from "@kindred/shared";
import { Navigate, useParams, useSearchParams } from "react-router";
import { ButtonLink } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../../../components/QueryStates";
import { ImportDoneBanner } from "../../imports/components/ImportDoneBanner";
import { useMyBooks } from "../hooks/useMyBooks";
import { bookCount, shelfLabel } from "../shelfLabels";
import { sortForShelf } from "../sortForShelf";
import { Bookshelf } from "./Bookshelf";

/** Home: my books on one shelf, as spines. */
export function MyShelfPage() {
  const params = useParams();
  const [search] = useSearchParams();
  const shelf = shelfSchema.safeParse(params.shelf);
  const { data: books, isPending, error, refetch } = useMyBooks();

  if (!shelf.success) return <Navigate to="/shelf/read" replace />;
  const label = shelfLabel[shelf.data];
  const onShelf = sortForShelf(books?.filter((b) => b.shelf === shelf.data) ?? []);
  const importId = search.get("import");

  return (
    <>
      <PageHeader
        title={label}
        subtitle={books ? `${bookCount(onShelf.length)} on the shelf` : undefined}
        actions={<ButtonLink to="/search">+ Add a book</ButtonLink>}
      />
      {importId && <ImportDoneBanner jobId={importId} />}
      {isPending ? (
        <LoadingState label="Loading your shelf…" />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : books.length === 0 ? (
        <EmptyState
          title="Your shelves are empty"
          actions={
            <>
              <ButtonLink to="/welcome/import">Import from Goodreads</ButtonLink>
              <ButtonLink to="/search" variant="secondary">
                Add a book
              </ButtonLink>
            </>
          }
        >
          Bring over your Goodreads history, or add the book you're reading now.
        </EmptyState>
      ) : onShelf.length === 0 ? (
        <EmptyState
          title={`Nothing on ${label} yet`}
          actions={
            <ButtonLink to="/search" variant="secondary">
              Add a book
            </ButtonLink>
          }
        />
      ) : (
        <Bookshelf
          books={onShelf}
          label={`${label} shelf`}
          hrefFor={(olKey) => `/books/${olKey}`}
        />
      )}
    </>
  );
}
