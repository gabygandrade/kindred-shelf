/**
 * Layout for signed-in pages: the sidebar (logo, shelf and friends navigation,
 * currently-reading card, account links) beside the page content.
 */
import { Link, NavLink, Outlet } from "react-router";
import { CurrentlyReadingCard } from "../features/shelf/components/CurrentlyReadingCard";
import styles from "./AppShell.module.css";
import { OpenLibraryCredit } from "./OpenLibraryCredit";

const navClass = styles.navLink;

export function AppShell() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.logo}>
          Kindred Shelf
        </Link>
        <nav aria-label="Main" className={styles.nav}>
          <NavLink to="/shelf/read" className={navClass}>
            Read
          </NavLink>
          <NavLink to="/shelf/reading" className={navClass}>
            Reading
          </NavLink>
          <NavLink to="/shelf/want" className={navClass}>
            Want to read
          </NavLink>
          <NavLink to="/friends" className={navClass}>
            Friends
          </NavLink>
        </nav>
        <CurrentlyReadingCard />
        <nav aria-label="Account" className={`${styles.nav} ${styles.secondaryNav}`}>
          <NavLink to="/settings" className={navClass}>
            Settings
          </NavLink>
        </nav>
      </aside>
      <div className={styles.content}>
        <main className={styles.main}>
          <Outlet />
        </main>
        <OpenLibraryCredit className={styles.footer} />
      </div>
    </div>
  );
}
