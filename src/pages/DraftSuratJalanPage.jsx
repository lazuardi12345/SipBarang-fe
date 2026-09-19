"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDeliveryOrders } from "../hooks/useDeliveryOrders";
import { DeliveryOrderDetailModal } from "../components/delivery-order/DeliveryOrderDetailModal";
import { Modal } from "../components/ui/Modal";
import { formatRupiah, formatTanggal } from "../utils/format";
import {
  FileText,
  AlertTriangle,
  PlusCircle,
  Truck,
  Send,
  Eye,
  RefreshCw,
  Layers,
  CheckCircle2,
  CheckSquare,
  Square,
  Building2,
  Package,
  Calendar,
  Search
} from "lucide-react";

export default function DraftSuratJalanPage() {
  const navigate = useNavigate();
  const { orders, loading, error, refresh, attachDocPerusahaan, submitToDirector } =
    useDeliveryOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal input/update Surat Jalan Pabrik
  const [attachModal, setAttachModal] = useState({
    open: false,
    order: null,
    noDocPerusahaan: "",
    tglDocPerusahaan: new Date().toISOString().split("T")[0],
    keteranganDoc: "",
    submitDirectly: false,
    processing: false,
    error: null,
  });

  // Filter orders that don't have Surat Jalan yet OR are in DRAFT / PLANNING
  const draftOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === "DRAFT" ||
        o.status === "PLANNING" ||
        !o.noDocPerusahaan ||
        o.noDocPerusahaan.trim() === ""
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return draftOrders;
    const q = searchQuery.toLowerCase();
    return draftOrders.filter((o) => {
      const matchNo = (o.noDO || "").toLowerCase().includes(q);
      const matchToko = (o.namaToko || o.namaPenerima || "").toLowerCase().includes(q);
      const matchRute = (o.tujuanKirim || "").toLowerCase().includes(q);
      const matchDoc = (o.noDocPerusahaan || "").toLowerCase().includes(q);
      const matchSupir = (o.namaSupir || "").toLowerCase().includes(q);
      const matchPolisi = (o.noPolisiKendaraan || "").toLowerCase().includes(q);
      return matchNo || matchToko || matchRute || matchDoc || matchSupir || matchPolisi;
    });
  }, [draftOrders, searchQuery]);

  // Metrics
  const totalKoli = useMemo(
    () => draftOrders.reduce((sum, o) => sum + (Number(o.jumlahKoli) || 0), 0),
    [draftOrders]
  );
  const totalBersih = useMemo(
    () => draftOrders.reduce((sum, o) => sum + (Number(o.totalSetelahPPh) || 0), 0),
    [draftOrders]
  );
  const totalToko = useMemo(() => {
    const tokoSet = new Set(draftOrders.map((o) => o.namaToko || o.namaPenerima).filter(Boolean));
    return tokoSet.size;
  }, [draftOrders]);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const openAttachModal = (order, submitDirectly = false) => {
    setAttachModal({
      open: true,
      order,
      noDocPerusahaan: order.noDocPerusahaan || "",
      tglDocPerusahaan: order.tglDocPerusahaan || new Date().toISOString().split("T")[0],
      keteranganDoc: order.keteranganDoc || "",
      submitDirectly,
      processing: false,
      error: null,
    });
  };

  const handleSaveDoc = async () => {
    if (!attachModal.order) return;
    if (!attachModal.noDocPerusahaan.trim()) {
      setAttachModal((prev) => ({
        ...prev,
        error: "Nomor Dokumen / Surat Jalan dari Pabrik wajib diisi",
      }));
      return;
    }

    setAttachModal((prev) => ({ ...prev, processing: true, error: null }));
    try {
      if (attachModal.submitDirectly) {
        await submitToDirector(attachModal.order.id, {
          noDocPerusahaan: attachModal.noDocPerusahaan.trim(),
          tglDocPerusahaan: attachModal.tglDocPerusahaan,
          keteranganDoc: attachModal.keteranganDoc,
        });
      } else {
        await attachDocPerusahaan(attachModal.order.id, {
          noDocPerusahaan: attachModal.noDocPerusahaan.trim(),
          tglDocPerusahaan: attachModal.tglDocPerusahaan,
          keteranganDoc: attachModal.keteranganDoc,
        });
      }

      setAttachModal({
        open: false,
        order: null,
        noDocPerusahaan: "",
        tglDocPerusahaan: "",
        keteranganDoc: "",
        submitDirectly: false,
        processing: false,
        error: null,
      });
      await refresh();
    } catch (err) {
      setAttachModal((prev) => ({
        ...prev,
        processing: false,
        error: err instanceof Error ? err.message : "Gagal menyimpan surat jalan pabrik",
      }));
    }
  };

  const handleBatchSubmit = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Ajukan ${selectedIds.length} pengiriman draft terpilih ke Direktur untuk di-ACC?`
      )
    ) {
      return;
    }

    try {
      for (const id of selectedIds) {
        await submitToDirector(id, {});
      }
      setSelectedIds([]);
      await refresh();
      alert("Pengiriman terpilih berhasil diajukan ke Direktur!");
    } catch (err) {
      alert("Sebagian pengiriman gagal diajukan: " + (err instanceof Error ? err.message : err));
    }
  };

  const handleGoToConsolidate = () => {
    navigate("/dashboard/pengiriman");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800 mb-1 border border-amber-300/60">
            <AlertTriangle size={13} />
            <span>Tampungan Draft Operasional</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-amber-600" />
            Pengiriman Belum Ada Surat Jalan Pabrik
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar pengiriman yang telah di-input tetapi masih menunggu fisik Surat Jalan resmi dari Pabrik (Karawang).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/pengiriman")}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
          >
            <PlusCircle size={15} />
            + Input Pengiriman Baru
          </button>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs disabled:opacity-50 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Segarkan
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Menunggu Surat Jalan</span>
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-700">
              <FileText size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-950 mt-2 font-mono">{draftOrders.length}</p>
          <span className="text-[11px] text-amber-700">Surat Jalan Pabrik Belum Turun</span>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Toko Tujuan</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Building2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{totalToko}</p>
          <span className="text-[11px] text-slate-400">Depo / Lokasi Pengantaran</span>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Muatan Tertahan</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Package size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-950 mt-2 font-mono">{totalKoli}</p>
          <span className="text-[11px] text-slate-400">Koli / Lembar Muatan</span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Estimasi Tagihan Bersih</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Truck size={18} />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-800 mt-2 font-mono">
            {formatRupiah(totalBersih)}
          </p>
          <span className="text-[11px] text-slate-400">Total Tarif Setelah PPh 2%</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900">
              Daftar Draft Input Pengiriman (Menunggu No. Dokumen Surat Jalan)
            </h2>
            <p className="text-xs text-slate-500">
              Saat fisik Surat Jalan Pabrik sudah ada di tangan, klik tombol <strong>&quot;Input Surat Jalan&quot;</strong> lalu ajukan ke Direktur untuk di-ACC.
            </p>
          </div>

          {/* Action Batch Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleGoToConsolidate}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
                >
                  <Layers size={13} />
                  <span>Satukan ({selectedIds.length}) ke 1 Kali Jalan</span>
                </button>

                <button
                  type="button"
                  onClick={handleBatchSubmit}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition"
                >
                  <Send size={13} />
                  <span>Ajukan ({selectedIds.length}) ke Direktur</span>
                </button>
              </>
            )}

            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari DO, Toko, Rute, Supir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none w-56 sm:w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Memuat daftar draft...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 size={44} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">
              Tidak Ada Pengiriman Tertahan (Semua Sudah Ada Surat Jalan)
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Seluruh data pengiriman sudah dilengkapi nomor surat jalan pabrik dan diajukan ke Direktur.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard/pengiriman")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              + Input Pengiriman Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-3 w-8 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        filteredOrders.length > 0 && selectedIds.length === filteredOrders.length
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-0"
                    />
                  </th>
                  <th className="px-3 py-3">No. DO & Jadwal</th>
                  <th className="px-3 py-3">Toko / Depo Tujuan</th>
                  <th className="px-3 py-3">Rute Karawang & Tarif</th>
                  <th className="px-3 py-3">Muatan Barang</th>
                  <th className="px-3 py-3">Armada & Supir</th>
                  <th className="px-3 py-3">Surat Jalan Pabrik</th>
                  <th className="px-3 py-3 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const isChecked = selectedIds.includes(order.id);
                  const hasDoc = order.noDocPerusahaan && order.noDocPerusahaan.trim() !== "";

                  return (
                    <tr
                      key={order.id}
                      className={`transition hover:bg-slate-50/70 ${
                        isChecked ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(order.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0"
                        />
                      </td>

                      <td className="px-3 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {order.noDO}
                        <p className="text-[10px] font-normal text-slate-400 font-sans mt-0.5">
                          {formatTanggal(order.createdAt)}
                        </p>
                        {order.noSchedule && (
                          <span className="text-[10px] text-blue-700 block font-normal">
                            Sch: {order.noSchedule}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-900">
                          {order.namaToko || order.namaPenerima || "-"}
                        </p>
                        <p className="text-slate-500 text-[11px] truncate max-w-xs">
                          {order.alamatLengkapTujuan || "-"}
                        </p>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="font-semibold text-blue-900">{order.tujuanKirim}</p>
                        <p className="text-emerald-700 font-bold text-[11px]">
                          {formatRupiah(order.totalSetelahPPh)}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          Bruto: {formatRupiah(order.biayaEkspedisi)}
                        </span>
                      </td>

                      <td className="px-3 py-3 max-w-xs">
                        <span className="text-slate-800 font-medium line-clamp-1">
                          {order.namaBarang || "-"}
                        </span>
                        <span className="text-[10px] font-bold text-purple-700">
                          [{order.jumlahKoli || 0} Koli / Lembar]
                        </span>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{order.namaSupir || "-"}</p>
                        <p className="text-slate-500 uppercase font-mono text-[10px]">
                          {order.noPolisiKendaraan || "(Belum diplot)"}
                        </p>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        {hasDoc ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-emerald-800 font-mono font-bold border border-emerald-300/60">
                              <CheckCircle2 size={11} />
                              {order.noDocPerusahaan}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-sans">
                              Tgl: {formatTanggal(order.tglDocPerusahaan)}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-red-700 font-medium border border-red-200 text-[11px]">
                            <AlertTriangle size={11} className="text-red-500" />
                            Belum Ada Surat Jalan
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
                            title="Lihat Detail"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openAttachModal(order, false)}
                            className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-600 shadow-2xs transition"
                            title="Input Surat Jalan Pabrik"
                          >
                            <FileText size={12} />
                            <span>{hasDoc ? "Ubah SJ" : "Input SJ Pabrik"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openAttachModal(order, true)}
                            className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition"
                            title="Ajukan ke Direktur untuk di-ACC"
                          >
                            <Send size={12} />
                            <span>Ajukan ACC</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Input Surat Jalan Pabrik */}
      {attachModal.open && (
        <Modal
          title={
            attachModal.submitDirectly
              ? "Input Surat Jalan & Langsung Ajukan ke Direktur"
              : "Input / Perbarui Nomor Dokumen Surat Jalan Pabrik"
          }
          onClose={() => setAttachModal({ ...attachModal, open: false })}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-1">
              <p>
                <strong className="text-amber-950">No. DO Ekspedisi:</strong>{" "}
                <span className="font-mono font-bold text-blue-900">
                  {attachModal.order?.noDO}
                </span>
              </p>
              <p>
                <strong className="text-amber-950">Toko Tujuan:</strong>{" "}
                {attachModal.order?.namaToko || attachModal.order?.namaPenerima}
              </p>
              <p>
                <strong className="text-amber-950">Rute & Supir:</strong>{" "}
                {attachModal.order?.tujuanKirim} · {attachModal.order?.namaSupir} (
                {attachModal.order?.noPolisiKendaraan || "Armada belum diplot"})
              </p>
            </div>

            {attachModal.error && (
              <div className="rounded-lg bg-red-50 p-2.5 text-red-700 flex items-center gap-1.5">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{attachModal.error}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Nomor Surat Jalan dari Perusahaan / Pabrik (Karawang) *
              </label>
              <input
                type="text"
                placeholder="Contoh: 26001073074"
                value={attachModal.noDocPerusahaan}
                onChange={(e) =>
                  setAttachModal({ ...attachModal, noDocPerusahaan: e.target.value })
                }
                autoFocus
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-xs font-bold focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Masukkan nomor fisik dokumen pengiriman yang dikeluarkan oleh pabrik GRC Karawang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Dokumen Pabrik
                </label>
                <input
                  type="date"
                  value={attachModal.tglDocPerusahaan}
                  onChange={(e) =>
                    setAttachModal({ ...attachModal, tglDocPerusahaan: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Catatan surat jalan..."
                  value={attachModal.keteranganDoc}
                  onChange={(e) =>
                    setAttachModal({ ...attachModal, keteranganDoc: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                disabled={attachModal.processing}
                onClick={() => setAttachModal({ ...attachModal, open: false })}
                className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={attachModal.processing}
                onClick={handleSaveDoc}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
              >
                {attachModal.submitDirectly ? <Send size={13} /> : <FileText size={13} />}
                {attachModal.processing
                  ? "Menyimpan..."
                  : attachModal.submitDirectly
                  ? "Simpan & Ajukan ke Direktur"
                  : "Simpan Surat Jalan Pabrik"}
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
