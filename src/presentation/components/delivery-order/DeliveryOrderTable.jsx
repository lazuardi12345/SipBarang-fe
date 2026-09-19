import { DeliveryOrder } from "./../../domain/entities/DeliveryOrder";
import { StatusBadge } from "./../../presentation/components/ui/StatusBadge";
import { formatRupiah, formatTanggal } from "./../../lib/format";
import { ReactNode } from "react";

export function DeliveryOrderTable({
  orders,
  renderAction,
  emptyMessage = "Belum ada data pengiriman.",
}: {
  orders: DeliveryOrder[];
  renderAction?: (order: DeliveryOrder) => ReactNode;
  emptyMessage?: string;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              No. DO
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Tanggal
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Supir / Kendaraan
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Tujuan
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Total
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Status
            </th>
            {renderAction && (
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">
                {order.noDO}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatTanggal(order.tanggalKirim)}
              </td>
              <td className="px-4 py-3 text-slate-600">
                <div>{order.namaSupir}</div>
                <div className="text-xs text-slate-400">
                  {order.noPolisiKendaraan}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">
                <div>{order.tujuanKirim}</div>
                <div className="text-xs text-slate-400">
                  {order.areaDistribusi}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatRupiah(order.totalSetelahPPh)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              {renderAction && (
                <td className="px-4 py-3">{renderAction(order)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
