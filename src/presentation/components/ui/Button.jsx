"use client";

import clsx from "clsx";

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-brand text-white hover:bg-brand-dark focus:ring-2 focus:ring-brand-light",
        variant === "secondary" &&
          "bg-slate-100 text-slate-700 hover:bg-slate-200",
        variant === "danger" &&
          "bg-red-600 text-white hover:bg-red-700",
        variant === "ghost" &&
          "bg-transparent text-slate-600 hover:bg-slate-100",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
