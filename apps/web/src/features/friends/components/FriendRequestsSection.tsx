/** Friend requests waiting for me (accept or decline) and ones I've sent (cancel). */
import type { FriendRequest } from "@kindred/shared";
import { errorMessage } from "../../../api/errorMessage";
import { Button } from "../../../components/Button";
import { ErrorState, LoadingState } from "../../../components/QueryStates";
import { useAcceptFriend, useRemoveFriend } from "../hooks/useFriendMutations";
import { useFriendRequests } from "../hooks/useFriends";
import styles from "./Friends.module.css";

function RequestItem({ request }: { request: FriendRequest }) {
  const accept = useAcceptFriend();
  const remove = useRemoveFriend();
  const { userId, displayName, username } = request.user;
  const busy = accept.isPending || remove.isPending;
  const error = accept.error ?? remove.error;

  return (
    <li className={styles.item}>
      <div>
        <span className={styles.name}>{displayName}</span>
        <p className={styles.muted}>@{username}</p>
      </div>
      <div className={styles.actions}>
        {request.direction === "incoming" ? (
          <>
            <Button
              size="small"
              disabled={busy}
              onClick={() => {
                accept.mutate(userId);
              }}
            >
              Accept
            </Button>
            <Button
              variant="ghost"
              size="small"
              disabled={busy}
              onClick={() => {
                remove.mutate(userId);
              }}
            >
              Decline
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="small"
            disabled={busy}
            onClick={() => {
              remove.mutate(userId);
            }}
          >
            Cancel request
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className={styles.error}>
          {errorMessage(error)}
        </p>
      )}
    </li>
  );
}

export function FriendRequestsSection() {
  const { data, isPending, error, refetch } = useFriendRequests();

  if (isPending) return <LoadingState label="Loading requests…" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (data.incoming.length === 0 && data.outgoing.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="requests-heading">
      <h2 id="requests-heading" className={styles.heading}>
        Requests
      </h2>
      {data.incoming.length > 0 && (
        <ul className={styles.list} aria-label="Waiting for you">
          {data.incoming.map((r) => (
            <RequestItem key={r.user.userId} request={r} />
          ))}
        </ul>
      )}
      {data.outgoing.length > 0 && (
        <>
          <p className={styles.muted}>Sent, waiting for them to accept:</p>
          <ul className={styles.list} aria-label="Sent by you">
            {data.outgoing.map((r) => (
              <RequestItem key={r.user.userId} request={r} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
