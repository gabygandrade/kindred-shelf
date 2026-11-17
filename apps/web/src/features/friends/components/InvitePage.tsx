/** The page an invite link opens (/invite/:token), where you choose to connect with whoever sent it. */
import { Link, useParams } from "react-router";
import { isApiError } from "../../../api/client";
import { errorMessage } from "../../../api/errorMessage";
import { Button, ButtonLink } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { useAcceptFriend, useRedeemFriendInvite } from "../hooks/useFriendMutations";
import styles from "./Friends.module.css";

/**
 * Opening a friend invite link. Using it is an explicit click (not automatic
 * on page load), and it only creates a request: you still accept it here.
 */
export function InvitePage() {
  const { token = "" } = useParams();
  const redeem = useRedeemFriendInvite();
  const accept = useAcceptFriend();
  const inviter = redeem.data?.user;

  if (accept.isSuccess && inviter) {
    return (
      <div className={styles.page}>
        <PageHeader title={`You and ${inviter.displayName} are friends`} />
        <div className={styles.actions}>
          <ButtonLink to={`/friends/${inviter.username}`}>See their shelf</ButtonLink>
        </div>
      </div>
    );
  }

  if (inviter) {
    return (
      <div className={styles.page}>
        <PageHeader
          title={`${inviter.displayName} wants to share shelves`}
          subtitle="Accept to see each other's shelves. Books you mark private stay private."
        />
        <div className={styles.actions}>
          <Button
            disabled={accept.isPending}
            onClick={() => {
              accept.mutate(inviter.userId);
            }}
          >
            Accept
          </Button>
          <ButtonLink to="/friends" variant="ghost">
            Decide later
          </ButtonLink>
        </div>
        {accept.error && (
          <p role="alert" className={styles.error}>
            {errorMessage(accept.error)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="You've been invited"
        subtitle="Someone on Kindred Shelf wants to share shelves with you."
      />
      {redeem.error ? (
        <p role="alert" className={styles.error}>
          {isApiError(redeem.error, "not_found")
            ? "This invite link has expired or was already used. Ask your friend for a new one."
            : errorMessage(redeem.error)}{" "}
          <Link to="/friends">Go to friends</Link>
        </p>
      ) : (
        <div className={styles.actions}>
          <Button
            disabled={redeem.isPending}
            onClick={() => {
              redeem.mutate(token);
            }}
          >
            Open invite
          </Button>
        </div>
      )}
    </div>
  );
}
