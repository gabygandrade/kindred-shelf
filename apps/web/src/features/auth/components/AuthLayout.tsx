/** The centered card layout shared by the sign-in and sign-up pages. */
import type { ReactNode } from "react";
import styles from "./AuthLayout.module.css";

export { styles as authStyles };

export function AuthLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.logo}>Kindred Shelf</span>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}
