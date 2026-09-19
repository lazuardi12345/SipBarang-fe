"use client";

import { useState } from "react";
import { useDeliveryOrders } from "../presentation/hooks/useDeliveryOrders";
import { Modal } from "../presentation/components/ui/Modal";
import { StatusBadge } from "../presentation/components/ui/StatusBadge";
import { ReportDeliveryForm } from "../presentation/components/delivery-order/ReportDeliveryForm";
import { DeliveryOrderDetailModal } from "../presentation/components/delivery-order/DeliveryOrderDetailModal";
import { formatRupiah, formatTanggal, formatTanggalWaktu } from "../lib/format";
import {
  PackageCheck,
  Eye,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  CheckCheck
} from "lucide-react";

export default function PelaporanPage() {
  const { orders, loading, error, refresh, laporkanTerkirim } = useDeliveryOrders();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);

  // 1. Siap dilaporkan (sudah di-ACC direktur untuk berangkat)
  const readyOrders = orders.filter(
    (o) => o.status === "DISETUJUI" || o.status === "DALAM_PENGIRIMAN"
  );

  // 2. Sudah dilaporkan, sedang menunggu konfirmasi/ACC akhir dari Direktur
  const pendingConfirmationOrders = orders.filter(
    (o) => o.status === "MENUNGGU_KONFIRMASI"
  );

  // 3. Selesai dan telah di-ACC Direktur
  const deliveredOrders = orders.filter((o) => o.status === "TERKIRIM");

  const handleLaporkan = async (input) => {
    await laporkanTerkirim(input);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <PackageCheck className="text-emerald-600" />
          Pelaporan Pengiriman Barang
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Laporkan pengiriman yang telah sampai ke toko/depo tujuan. Laporan akan diajukan ke Direktur untuk di-ACC (Konfirmasi Terkirim).
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* 1. SECTION: PENGIRIMAN SIAP DILAPORKAN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Truck size={18} className="text-blue-600" />
              <span>1. Pengiriman Berjalan (Siap Dilaporkan Terkirim)</span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                {readyOrders.length} DO
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Surat Jalan yang telah di-ACC Direktur untuk berangkat. Klik &quot;Lapor Terkirim&quot; setelah barang diterima toko.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Muat Ulang
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">Memuat data...</div>
        ) : readyOrders.length === 0 ? (
          <div className="py-12 text-center">
            <Truck size={38} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada armada yang sedang dalam perjalanan</p>
            <p className="text-xs text-slate-500 mt-1">
              Pengiriman akan muncul di sini setelah surat jalan disetujui (di-ACC) oleh Direktur.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {readyOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 hover:border-blue-400 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{order.noDO}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-slate-800 font-semibold text-sm">
                      {order.namaToko || order.namaPenerima} — [{order.areaDistribusi}] {order.tujuanKirim}
                    </p>
                    <p className="text-slate-500">
                      Supir: <strong>{order.namaSupir}</strong> ({order.noPolisiKendaraan}) · Tgl Kirim: {formatTanggal(order.tanggalKirim)}
                    </p>
                    <p className="text-slate-600">
                      Muatan:{" "}
                      {order.itemsBarang?.length > 0
                        ? order.itemsBarang.map((i) => `${i.namaBarang} (${i.jumlah})`).join(" • ")
                        : order.namaBarang || "-"}
                    </p>
                    {order.catatanDirektur && (
                      <p className="text-blue-800 font-medium">
                        📋 Instruksi Direktur: <em>{order.catatanDirektur}</em>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDetailOrder(order)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={13} />
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
                    >
                      <CheckCircle2 size={15} />
                      Lapor Terkirim
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. SECTION: MENUNGGU ACC KONFIRMASI DIREKTUR */}
      {pendingConfirmationOrders.length > 0 && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/20 p-6 shadow-sm space-y-4">
          <div className="border-b border-purple-100 pb-3">
            <h2 className="text-base font-semibold text-purple-950 flex items-center gap-2">
              <Clock size={18} className="text-purple-600" />
              <span>2. Menunggu ACC Konfirmasi Direktur</span>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                {pendingConfirmationOrders.length} DO
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Laporan pengiriman sudah Anda kirimkan dan saat ini menunggu verifikasi & konfirmasi akhir dari Direktur.
            </p>
          </div>

          <div className="space-y-3">
            {pendingConfirmationOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-purple-200 bg-white p-4 text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{order.noDO}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <span className="font-bold text-emerald-700">
                    {formatRupiah(order.totalSetelahPPh)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-500">Toko Tujuan: </span>
                    <strong className="text-slate-800">{order.namaToko || order.namaPenerima}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Diterima Oleh: </span>
                    <strong className="text-slate-800">{order.namaPenerimaBarang || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Waktu Lapor: </span>
                    <span className="text-slate-700">{formatTanggalWaktu(order.tanggalDiterima)}</span>
                  </div>
                </div>

                {order.catatanPelaporan && (
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg">
                    Catatan Supir/Admin: &ldquo;{order.catatanPelaporan}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SECTION: RIWAYAT PENGIRIMAN TERKIRIM (SELESAI) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <CheckCheck size={18} className="text-emerald-600" />
            <span>3. Riwayat Selesai Terkirim (Sudah di-ACC Direktur)</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {deliveredOrders.length} DO
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengiriman yang telah selesai dan dikonfirmasi Direktur. Siap untuk proses pembuatan Invoice Resmi.
          </p>
        </div>

        {deliveredOrders.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Belum ada pengiriman yang telah selesai dan dikonfirmasi Direktur.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">No. DO</th>
                  <th className="px-4 py-3">Toko / Tujuan</th>
                  <th className="px-4 py-3">Penerima Barang</th>
                  <th className="px-4 py-3">Tgl. Selesai</th>
                  <th className="px-4 py-3">Tagihan Bersih</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{order.noDO}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{order.namaToko || order.namaPenerima}</p>
                      <p className="text-slate-500">{order.tujuanKirim}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{order.namaPenerimaBarang || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatTanggalWaktu(order.tanggalDiterima)}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">{formatRupiah(order.totalSetelahPPh)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setDetailOrder(order)}
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
          </div>
        )}
      </div>

      {/* Modal Lapor Terkirim */}
      {selectedOrder && (
        <Modal
          title={`Laporan Pengiriman: ${selectedOrder.noDO}`}
          onClose={() => setSelectedOrder(null)}
        >
          <ReportDeliveryForm
            order={selectedOrder}
            onSubmit={handleLaporkan}
            onClose={() => setSelectedOrder(null)}
          />
        </Modal>
      )}

      {/* Modal Detail DO */}
      {detailOrder && (
        <DeliveryOrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}
    </div>
  );
}
