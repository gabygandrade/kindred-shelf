/** Shared button styles: a real <button>, and ButtonLink for navigation that should look like a button. */
import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface StyleProps {
  variant?: Variant;
  size?: "normal" | "small";
}

function classes({ variant = "primary", size = "normal" }: StyleProps, extra?: string) {
  return [styles.button, styles[variant], size === "small" && styles.small, extra]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={classes({ variant, size }, className)} {...props} />;
}

/** A link that looks like a button (navigation stays a real <a href>). */
export function ButtonLink({ variant, size, className, ...props }: StyleProps & LinkProps) {
  return <Link className={classes({ variant, size }, className)} {...props} />;
}
