/** The list of my friends, each linking to their shelf, with a button to remove them. */
import type { Friend } from "@kindred/shared";
import { useState } from "react";
import { Link } from "react-router";
import { errorMessage } from "../../../api/errorMessage";
import { Button } from "../../../components/Button";
import { EmptyState, ErrorState, LoadingState } from "../../../components/QueryStates";
import { useRemoveFriend } from "../hooks/useFriendMutations";
import { useFriends } from "../hooks/useFriends";
import styles from "./Friends.module.css";

function countsLine({ counts }: Friend): string {
  return `${counts.read} read · ${counts.reading} reading · ${counts.want} want to read`;
}

function FriendItem({ friend }: { friend: Friend }) {
  const remove = useRemoveFriend();
  const [confirming, setConfirming] = useState(false);
  const { userId, username, displayName } = friend.user;

  return (
    <li className={styles.item}>
      <div>
        <Link to={`/friends/${username}`} className={styles.nameLink}>
          {displayName}
        </Link>
        <p className={styles.muted}>{countsLine(friend)}</p>
      </div>
      <div className={styles.actions}>
        {confirming ? (
          <>
            <span className={styles.muted}>Stop sharing shelves with {displayName}?</span>
            <Button
              variant="danger"
              size="small"
              disabled={remove.isPending}
              onClick={() => {
                remove.mutate(userId);
              }}
            >
              Remove
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                setConfirming(false);
              }}
            >
              Keep
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="small"
            aria-label={`Remove ${displayName} as a friend`}
            onClick={() => {
              setConfirming(true);
            }}
          >
            Remove
          </Button>
        )}
      </div>
      {remove.error && (
        <p role="alert" className={styles.error}>
          {errorMessage(remove.error)}
        </p>
      )}
    </li>
  );
}

export function FriendList() {
  const { data: friends, isPending, error, refetch } = useFriends();

  return (
    <section className={styles.section} aria-labelledby="friends-heading">
      <h2 id="friends-heading" className={styles.heading}>
        Your friends
      </h2>
      {isPending ? (
        <LoadingState label="Loading friends…" />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : friends.length === 0 ? (
        <EmptyState headingLevel="h3" title="No friends yet">
          Send a request by username or share an invite link. Shelves are shared only once you both
          accept.
        </EmptyState>
      ) : (
        <ul className={styles.list}>
          {friends.map((f) => (
            <FriendItem key={f.user.userId} friend={f} />
          ))}
        </ul>
      )}
    </section>
  );
}
