/** The Friends page: requests, the friend list, adding a friend and sharing an invite link. */
import { PageHeader } from "../../../components/PageHeader";
import { AddFriendForm } from "./AddFriendForm";
import { FriendList } from "./FriendList";
import { FriendRequestsSection } from "./FriendRequestsSection";
import styles from "./Friends.module.css";
import { InviteLinkCard } from "./InviteLinkCard";

export function FriendsPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Friends"
        subtitle="Friends see each other's shelves. Private books stay yours."
      />
      <FriendRequestsSection />
      <FriendList />
      <AddFriendForm />
      <InviteLinkCard />
    </div>
  );
}
