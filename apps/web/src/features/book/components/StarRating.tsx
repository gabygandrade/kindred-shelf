/** Star rating components: an editable five-star control and a read-only display. */
import styles from "./StarRating.module.css";

const STARS = [1, 2, 3, 4, 5] as const;

interface StarRatingProps {
  value: number | null;
  /** Called with the new rating, or null when the current rating is pressed again (clears it). */
  onChange: (rating: number | null) => void;
  disabled?: boolean;
  label?: string;
}

/** Five 44px star buttons in a labeled group. Whole stars only. */
export function StarRating({ value, onChange, disabled, label = "Your rating" }: StarRatingProps) {
  return (
    <div role="group" aria-label={label} className={styles.group}>
      {STARS.map((n) => (
        <button
          key={n}
          type="button"
          className={styles.star}
          aria-label={n === 1 ? "1 star" : `${n} stars`}
          aria-pressed={value === n}
          disabled={disabled}
          onClick={() => {
            onChange(value === n ? null : n);
          }}
        >
          <span aria-hidden="true">{value !== null && n <= value ? "★" : "☆"}</span>
        </button>
      ))}
    </div>
  );
}

/** A read-only rating, e.g. on a friend's book. */
export function RatingDisplay({ value, owner }: { value: number; owner: string }) {
  return (
    <span className={styles.display}>
      <span aria-hidden="true">{STARS.map((n) => (n <= value ? "★" : "☆")).join("")}</span>
      <span className="sr-only">
        {owner} rated it {value} out of 5
      </span>
    </span>
  );
}
