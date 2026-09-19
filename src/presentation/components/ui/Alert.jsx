import clsx from "clsx";

export function Alert({ type = "error", children }) {
  return (
    <div
      className={clsx(
        "rounded-lg border px-3 py-2 text-sm",
        type === "error" && "border-red-200 bg-red-50 text-red-700",
        type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        type === "info" && "border-blue-200 bg-blue-50 text-blue-700"
      )}
    >
      {children}
    </div>
  );
}
