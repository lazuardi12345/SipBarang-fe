import { StatusDO, STATUS_LABEL } from "../../../domain/entities/DeliveryOrder";
import clsx from "clsx";

const COLOR = {
  [StatusDO.PLANNING]: "bg-slate-100 text-slate-700 border border-slate-300",
  [StatusDO.DRAFT]: "bg-slate-100 text-slate-700 border border-slate-300",
  [StatusDO.MENUNGGU_ACC]: "bg-amber-100 text-amber-800 border border-amber-300",
  [StatusDO.DISETUJUI]: "bg-blue-100 text-blue-800 border border-blue-300",
  [StatusDO.DITOLAK]: "bg-rose-100 text-rose-800 border border-rose-300",
  [StatusDO.DALAM_PENGIRIMAN]: "bg-indigo-100 text-indigo-800 border border-indigo-300",
  [StatusDO.MENUNGGU_KONFIRMASI]: "bg-purple-100 text-purple-800 border border-purple-300 animate-pulse",
  [StatusDO.TERKIRIM]: "bg-emerald-100 text-emerald-800 border border-emerald-300",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2.5 py-1 text-xs font-semibold",
        COLOR[status] || "bg-slate-100 text-slate-700"
      )}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}
