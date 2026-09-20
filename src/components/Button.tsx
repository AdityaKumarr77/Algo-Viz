import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  block?: boolean;
  children: ReactNode;
}

export function Button({ variant = "ghost", block = false, className = "", children, ...rest }: ButtonProps) {
  const classes = ["btn", variant === "primary" ? "btn-primary" : "btn-ghost", block ? "btn-block" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
