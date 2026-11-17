/** The Friends page: requests, the friend list, adding a friend and sharing an invite link. */
import { PageHeader } from "../../../components/PageHeader";
import { FriendList } from "./FriendList";
import { FriendRequestsSection } from "./FriendRequestsSection";
import styles from "./Friends.module.css";

export function FriendsPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Friends"
        subtitle="Friends see each other's shelves. Private books stay yours."
      />
      <FriendRequestsSection />
      <FriendList />
    </div>
  );
}
