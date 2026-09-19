import clsx from "clsx";

export function Card({
  children,
  className,
  ...rest
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
