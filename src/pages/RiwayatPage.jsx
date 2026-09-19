"use client";

import { useState } from "react";
import { useDeliveryOrders } from "../hooks/useDeliveryOrders";
import { DeliveryOrderDetailModal } from "../components/delivery-order/DeliveryOrderDetailModal";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatRupiah, formatTanggal, formatTanggalWaktu } from "../utils/format";
import { History, Search, Eye, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "MENUNGGU_ACC", label: "Menunggu ACC" },
  { value: "DISETUJUI", label: "Disetujui" },
  { value: "DITOLAK", label: "Ditolak" },
  { value: "DALAM_PENGIRIMAN", label: "Dalam Pengiriman" },
  { value: "TERKIRIM", label: "Terkirim" },
];

export default function RiwayatPage() {
  const { orders, loading, error, refresh } = useDeliveryOrders();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = orders.filter((o) => {
    const matchStatus = !filterStatus || o.status === filterStatus;
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      o.noDO?.toLowerCase().includes(term) ||
      o.namaToko?.toLowerCase().includes(term) ||
      o.tujuanKirim?.toLowerCase().includes(term) ||
      o.namaSupir?.toLowerCase().includes(term) ||
      o.noDocPerusahaan?.toLowerCase().includes(term) ||
      o.noPolisiKendaraan?.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="text-indigo-600" />
            Riwayat Semua Pengiriman
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Seluruh riwayat Surat Jalan ekspedisi PT ALMAIRA YUNIAR TREK.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Muat Ulang
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. DO, nama toko, tujuan, supir, atau no. polisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Memuat riwayat pengiriman...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <History size={38} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {search || filterStatus ? "Tidak ada data yang cocok dengan pencarian." : "Belum ada riwayat pengiriman."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-3">No. DO Ekspedisi</th>
                  <th className="px-4 py-3">Doc Pabrik / Toko</th>
                  <th className="px-4 py-3">Rute Tujuan</th>
                  <th className="px-4 py-3">Supir & Armada</th>
                  <th className="px-4 py-3 text-right">Tagihan Bersih</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold text-slate-900">{order.noDO}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatTanggalWaktu(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{order.namaToko || order.namaPenerima || "-"}</p>
                      <p className="font-mono text-[11px] text-slate-500 mt-0.5">Doc: {order.noDocPerusahaan || "-"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-blue-900">{order.tujuanKirim}</p>
                      <p className="text-[11px] text-slate-500">{order.areaDistribusi}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{order.namaSupir}</p>
                      <p className="font-mono uppercase text-[11px] text-slate-500">{order.noPolisiKendaraan}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-emerald-700">{formatRupiah(order.totalSetelahPPh)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                      >
                        <Eye size={13} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
              Menampilkan <strong>{filtered.length}</strong> dari <strong>{orders.length}</strong> total surat jalan
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <DeliveryOrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
