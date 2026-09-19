"use client";

import { useState } from "react";
import { useDeliveryOrders } from "../presentation/hooks/useDeliveryOrders";
import { useAuth } from "../presentation/contexts/AuthContext";
import { DeliveryOrderDetailModal } from "../presentation/components/delivery-order/DeliveryOrderDetailModal";
import { StatusBadge } from "../presentation/components/ui/StatusBadge";
import { Modal } from "../presentation/components/ui/Modal";
import { formatRupiah, formatTanggal, formatTanggalWaktu } from "../lib/format";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  PackageCheck,
  Truck,
  FileText
} from "lucide-react";

export default function ApprovalPage() {
  const { orders, loading, refresh, setujui, tolak, konfirmasiTerkirim } = useDeliveryOrders();
  const { user } = useAuth();

  // Tab: 'MENUNGGU_ACC' | 'MENUNGGU_KONFIRMASI' | 'DISETUJUI' | 'TERKIRIM' | 'DITOLAK'
  const [activeTab, setActiveTab] = useState("MENUNGGU_ACC");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modal actions
  // type: 'approve' (Gate 1) | 'reject' | 'confirm_delivered' (Gate 2)
  const [approvalModal, setApprovalModal] = useState({
    open: false,
    order: null,
    type: "approve",
    note: "",
  });
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState(null);

  const pendingBerangkat = orders.filter((o) => o.status === "MENUNGGU_ACC");
  const pendingKonfirmasi = orders.filter((o) => o.status === "MENUNGGU_KONFIRMASI");
  const onGoingOrders = orders.filter(
    (o) => o.status === "DISETUJUI" || o.status === "DALAM_PENGIRIMAN"
  );
  const deliveredOrders = orders.filter((o) => o.status === "TERKIRIM");
  const rejectedOrders = orders.filter((o) => o.status === "DITOLAK");

  const filteredOrders =
    activeTab === "MENUNGGU_ACC"
      ? pendingBerangkat
      : activeTab === "MENUNGGU_KONFIRMASI"
      ? pendingKonfirmasi
      : activeTab === "DISETUJUI"
      ? onGoingOrders
      : activeTab === "TERKIRIM"
      ? deliveredOrders
      : rejectedOrders;

  const handleOpenAction = (order, type) => {
    setActionError(null);
    setApprovalModal({ open: true, order, type, note: "" });
  };

  const handleConfirmAction = async () => {
    if (!approvalModal.order) return;
    setActionError(null);

    if (
      approvalModal.type === "reject" &&
      (!approvalModal.note || approvalModal.note.trim() === "")
    ) {
      setActionError("Alasan penolakan wajib diisi");
      return;
    }

    setProcessing(true);
    try {
      if (approvalModal.type === "approve") {
        await setujui(approvalModal.order.id, user?.nama || "Direktur", approvalModal.note);
      } else if (approvalModal.type === "confirm_delivered") {
        await konfirmasiTerkirim(approvalModal.order.id, approvalModal.note);
      } else {
        await tolak(approvalModal.order.id, user?.nama || "Direktur", approvalModal.note);
      }
      setApprovalModal({ open: false, order: null, type: "approve", note: "" });
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal memproses persetujuan");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="text-amber-600" />
            Approval Direktur
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dua tahap persetujuan: 1. ACC Surat Jalan untuk Berangkat · 2. ACC Konfirmasi Laporan Selesai Terkirim.
          </p>
        </div>

        {/* Status Tab Counters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-200/80 p-1 self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("MENUNGGU_ACC")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeTab === "MENUNGGU_ACC"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>1. ACC Berangkat</span>
            <span className="rounded-full bg-white/25 px-1.5 py-0.2 text-[11px]">
              {pendingBerangkat.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MENUNGGU_KONFIRMASI")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeTab === "MENUNGGU_KONFIRMASI"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>2. ACC Terkirim</span>
            <span className="rounded-full bg-white/25 px-1.5 py-0.2 text-[11px]">
              {pendingKonfirmasi.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DISETUJUI")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeTab === "DISETUJUI"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Sedang Berjalan</span>
            <span className="rounded-full bg-white/25 px-1.5 py-0.2 text-[11px]">
              {onGoingOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TERKIRIM")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeTab === "TERKIRIM"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Selesai (Terkirim)</span>
            <span className="rounded-full bg-white/25 px-1.5 py-0.2 text-[11px]">
              {deliveredOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DITOLAK")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeTab === "DITOLAK"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Ditolak</span>
            <span className="rounded-full bg-white/25 px-1.5 py-0.2 text-[11px]">
              {rejectedOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b pb-3 mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            {activeTab === "MENUNGGU_ACC" && "Daftar Pengiriman Menunggu ACC Surat Jalan (Gate 1)"}
            {activeTab === "MENUNGGU_KONFIRMASI" && "Daftar Laporan Terkirim Menunggu Konfirmasi Direktur (Gate 2)"}
            {activeTab === "DISETUJUI" && "Pengiriman yang Telah Disetujui & Sedang Berjalan"}
            {activeTab === "TERKIRIM" && "Pengiriman yang Sudah Selesai & Dikonfirmasi (Siap Buat Invoice)"}
            {activeTab === "DITOLAK" && "Pengiriman yang Ditolak"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === "MENUNGGU_ACC" &&
              "Periksa nomor surat jalan dari pabrik, rincian muatan, dan armada sebelum memberikan persetujuan berangkat."}
            {activeTab === "MENUNGGU_KONFIRMASI" &&
              "Admin/Supir telah melaporkan barang sampai di toko tujuan. Konfirmasi untuk menandai pengiriman selesai."}
            {activeTab === "DISETUJUI" &&
              "Armada sedang dalam perjalanan mengantar barang ke alamat toko/depo tujuan."}
            {activeTab === "TERKIRIM" &&
              "Pengiriman selesai. Data ini dapat langsung diproses ke penerbitan Invoice Resmi."}
            {activeTab === "DITOLAK" && "Surat jalan atau laporan pengiriman yang tidak disetujui."}
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Memuat data approval...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardCheck size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              Tidak ada pengiriman dalam kategori ini
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-sm font-bold text-blue-800">
                      {order.noDO}
                    </span>
                    <span className="text-xs text-slate-500">
                      Schedule: <strong className="text-slate-700">{order.noSchedule || "-"}</strong>
                    </span>
                    <span className="text-xs text-slate-500">
                      Tgl Kirim: <strong className="text-slate-700">{formatTanggal(order.tanggalKirim)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-extrabold text-emerald-700">
                      {formatRupiah(order.totalSetelahPPh)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Toko / Depo Penerima:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {order.namaToko || order.namaPenerima || "-"}
                    </p>
                    <p className="text-slate-500 font-mono mt-0.5">
                      Doc Pabrik: <strong>{order.noDocPerusahaan || "(Belum ada)"}</strong>
                    </p>
                    <p className="text-slate-500 mt-0.5 truncate">{order.alamatLengkapTujuan || "-"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Rute Tujuan & Tarif:</span>
                    <p className="font-semibold text-blue-950 mt-0.5">
                      [{order.areaDistribusi}] {order.tujuanKirim}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      Ekspedisi: {formatRupiah(order.biayaEkspedisi)} (PPh 2%:{" "}
                      {formatRupiah(order.biayaEkspedisi - order.totalSetelahPPh)})
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500">Supir & Armada:</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {order.namaSupir} {order.noHpSupir ? `(${order.noHpSupir})` : ""}
                    </p>
                    <p className="text-slate-500 font-mono uppercase mt-0.5">
                      {order.noPolisiKendaraan} - {order.tipeMobilRit || "8 Ton"}
                    </p>
                  </div>
                </div>

                {/* Info Laporan Jika Status MENUNGGU_KONFIRMASI atau TERKIRIM */}
                {(order.status === "MENUNGGU_KONFIRMASI" || order.status === "TERKIRIM") && (
                  <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50/50 p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900 mb-1">
                      <PackageCheck size={15} />
                      <span>Data Laporan Penerimaan Barang</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-500">Diterima Oleh: </span>
                        <strong>{order.namaPenerimaBarang || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Waktu Diterima: </span>
                        <strong>{formatTanggalWaktu(order.tanggalDiterima)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Catatan Supir/Admin: </span>
                        <span>{order.catatanPelaporan || "-"}</span>
                      </div>
                    </div>
                    {order.buktiPengirimanUrl && (
                      <p className="text-xs text-blue-600 mt-1">
                        📎 Bukti Foto/TTD: <em>{order.buktiPengirimanUrl}</em>
                      </p>
                    )}
                  </div>
                )}

                {/* Muatan Barang Singkat */}
                <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-700">Muatan Barang: </span>
                    <span className="text-slate-600">
                      {order.itemsBarang && order.itemsBarang.length > 0
                        ? order.itemsBarang
                            .map((i) => `${i.namaBarang} (${i.jumlah} ${i.satuan || "pcs"})`)
                            .join(" • ")
                        : order.namaBarang || "-"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <Eye size={13} />
                    Lihat Detail Surat Jalan
                  </button>
                </div>

                {/* Gate 1 Action Buttons: MENUNGGU_ACC (ACC Berangkat) */}
                {order.status === "MENUNGGU_ACC" && (
                  <div className="mt-4 pt-3 border-t flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenAction(order, "reject")}
                      className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <XCircle size={15} />
                      Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAction(order, "approve")}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
                    >
                      <CheckCircle size={15} />
                      ACC Berangkat (Setujui)
                    </button>
                  </div>
                )}

                {/* Gate 2 Action Buttons: MENUNGGU_KONFIRMASI (ACC Terkirim) */}
                {order.status === "MENUNGGU_KONFIRMASI" && (
                  <div className="mt-4 pt-3 border-t flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenAction(order, "reject")}
                      className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <XCircle size={15} />
                      Tolak Laporan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAction(order, "confirm_delivered")}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700 shadow-sm transition"
                    >
                      <PackageCheck size={15} />
                      ACC / Konfirmasi Terkirim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Tindakan Direktur */}
      {approvalModal.open && (
        <Modal
          title={
            approvalModal.type === "approve"
              ? "ACC Persetujuan Berangkat (Gate 1)"
              : approvalModal.type === "confirm_delivered"
              ? "ACC Konfirmasi Terkirim (Gate 2)"
              : "Tolak Pengiriman / Laporan"
          }
          onClose={() => setApprovalModal({ open: false, order: null, type: "approve", note: "" })}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
              <p>
                <strong className="text-slate-700">No. DO:</strong> {approvalModal.order?.noDO}
              </p>
              <p>
                <strong className="text-slate-700">Toko Tujuan:</strong>{" "}
                {approvalModal.order?.namaToko || approvalModal.order?.namaPenerima}
              </p>
              <p>
                <strong className="text-slate-700">Doc Pabrik:</strong>{" "}
                {approvalModal.order?.noDocPerusahaan || "(Draft)"}
              </p>
              <p>
                <strong className="text-slate-700">Total Tagihan:</strong>{" "}
                <span className="font-bold text-emerald-700">
                  {formatRupiah(approvalModal.order?.totalSetelahPPh)}
                </span>
              </p>
            </div>

            {actionError && (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {approvalModal.type === "reject"
                  ? "Alasan Penolakan (Wajib Diisi) *"
                  : "Catatan Direktur (Opsional)"}
              </label>
              <textarea
                rows={3}
                placeholder={
                  approvalModal.type === "approve"
                    ? "Instruksi khusus untuk supir sebelum jalan (opsional)..."
                    : approvalModal.type === "confirm_delivered"
                    ? "Catatan konfirmasi selesai / verifikasi dokumen..."
                    : "Tuliskan alasan penolakan..."
                }
                value={approvalModal.note}
                onChange={(e) =>
                  setApprovalModal((prev) => ({ ...prev, note: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                disabled={processing}
                onClick={() => setApprovalModal({ open: false, order: null, type: "approve", note: "" })}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleConfirmAction}
                className={`rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50 ${
                  approvalModal.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : approvalModal.type === "confirm_delivered"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processing
                  ? "Memproses..."
                  : approvalModal.type === "approve"
                  ? "Konfirmasi ACC Berangkat"
                  : approvalModal.type === "confirm_delivered"
                  ? "Konfirmasi Terkirim Selesai"
                  : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Detail DO */}
      {selectedOrder && (
        <DeliveryOrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
