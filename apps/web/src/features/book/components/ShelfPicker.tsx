/** Control for choosing which shelf a book is on (Reading, Read, Want to read). */
import type { Shelf } from "@kindred/shared";
import { useId } from "react";
import { shelfLabel } from "../../shelf/shelfLabels";
import styles from "./ShelfPicker.module.css";

// Reading first, as in the mockup: the order a book usually moves through.
const ORDER: Shelf[] = ["reading", "read", "want"];

interface ShelfPickerProps {
  value: Shelf;
  onChange: (shelf: Shelf) => void;
  disabled?: boolean;
}

/** A segmented control built from real radio buttons, so arrow keys and screen readers work. */
export function ShelfPicker({ value, onChange, disabled }: ShelfPickerProps) {
  const name = useId();
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Shelf</legend>
      <div className={styles.segments}>
        {ORDER.map((shelf) => {
          const id = `${name}-${shelf}`;
          return (
            <span key={shelf}>
              <input
                id={id}
                type="radio"
                name={name}
                className={styles.input}
                checked={value === shelf}
                disabled={disabled}
                onChange={() => {
                  onChange(shelf);
                }}
              />
              <label htmlFor={id} className={styles.segment}>
                {shelfLabel[shelf]}
              </label>
            </span>
          );
        })}
      </div>
    </fieldset>
  );
}
