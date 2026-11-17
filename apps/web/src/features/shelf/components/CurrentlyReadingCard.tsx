/** The "Currently reading" card in the sidebar. */
import { Link } from "react-router";
import { useMyBooks } from "../hooks/useMyBooks";
import { sortForShelf } from "../sortForShelf";
import styles from "./CurrentlyReadingCard.module.css";
import { authorLine } from "./Spine";

/** The most recently started book on Reading. Hidden when that shelf is empty. */
export function CurrentlyReadingCard() {
  const { data: books } = useMyBooks();
  const [current] = sortForShelf(books?.filter((b) => b.shelf === "reading") ?? []);
  if (!current) return null;
  return (
    <Link to={`/books/${current.work.olKey}`} className={styles.card}>
      <span className={styles.label}>Currently reading</span>
      <span className={styles.title}>{current.work.title}</span>
      <span className={styles.author}>{authorLine(current.work)}</span>
    </Link>
  );
}
