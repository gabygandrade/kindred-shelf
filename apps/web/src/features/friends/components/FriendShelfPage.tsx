/** A friend's bookshelf (/friends/:username), showing only the books they share. */
import { shelfSchema } from "@kindred/shared";
import { Link, Navigate, useParams, useSearchParams } from "react-router";
import { isApiError } from "../../../api/client";
import { ButtonLink } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../../../components/QueryStates";
import { Bookshelf } from "../../shelf/components/Bookshelf";
import { useUserShelf } from "../../shelf/hooks/useUserShelf";
import { bookCount, SHELVES, shelfLabel } from "../../shelf/shelfLabels";
import { sortForShelf } from "../../shelf/sortForShelf";
import styles from "./FriendShelfPage.module.css";

/** A friend's bookshelf. The API only sends their public books, and counts come from the same list. */
export function FriendShelfPage() {
  const { username = "" } = useParams();
  const [search] = useSearchParams();
  const shelf = shelfSchema.catch("read").parse(search.get("shelf") ?? "read");
  const { data, isPending, error, refetch } = useUserShelf(username);

  if (isPending) return <LoadingState label="Loading their shelf…" />;
  if (isApiError(error, "not_found")) {
    // Same screen for "no such member" and "not friends": the API doesn't say which either.
    return (
      <EmptyState
        title="This shelf isn't available"
        actions={<ButtonLink to="/friends">Back to friends</ButtonLink>}
      >
        Shelves are shared between friends once both of you accept.
      </EmptyState>
    );
  }
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (data.isOwn) return <Navigate to={`/shelf/${shelf}`} replace />;

  const name = data.owner.displayName;
  const onShelf = sortForShelf(data.books.filter((b) => b.shelf === shelf));

  return (
    <>
      <PageHeader
        title={`${name}'s shelf`}
        subtitle={`${bookCount(data.counts[shelf])} on ${shelfLabel[shelf]}`}
      />
      <nav aria-label={`${name}'s shelves`} className={styles.tabs}>
        {SHELVES.map((s) => (
          <Link
            key={s}
            to={`?shelf=${s}`}
            className={styles.tab}
            aria-current={s === shelf ? "page" : undefined}
          >
            {shelfLabel[s]} ({data.counts[s]})
          </Link>
        ))}
      </nav>
      {onShelf.length === 0 ? (
        <EmptyState title={`Nothing on ${shelfLabel[shelf]}`} />
      ) : (
        <Bookshelf
          books={onShelf}
          label={`${name}'s ${shelfLabel[shelf]} shelf`}
          hrefFor={(olKey) => `/friends/${username}/books/${olKey}`}
        />
      )}
    </>
  );
}
