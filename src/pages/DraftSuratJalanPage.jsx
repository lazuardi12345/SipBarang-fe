"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDeliveryOrders } from "../hooks/useDeliveryOrders";
import { DeliveryOrderDetailModal } from "../components/delivery-order/DeliveryOrderDetailModal";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { usePagination } from "../hooks/usePagination";
import { formatRupiah, formatTanggal } from "../utils/format";
import {
  FileText,
  AlertTriangle,
  Truck,
  Send,
  Eye,
  RefreshCw,
  CheckCircle2,
  Building2,
  Calendar,
  Search,
  Trash2,
  User,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

export default function DraftSuratJalanPage() {
  const navigate = useNavigate();
  const { orders, loading, error, refresh, attachDocPerusahaan, submitToDirector, remove } =
    useDeliveryOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modal input/update Surat Jalan Pabrik & Supir
  const [attachModal, setAttachModal] = useState({
    open: false,
    order: null,
    noDocPerusahaan: "",
    tglDocPerusahaan: "",
    namaSupir: "",
    noHpSupir: "",
    keteranganDoc: "",
    processing: false,
    error: null,
  });

  // Filter orders yang perlu Surat Jalan Pabrik dan Supir:
  // 1. SO yang sudah di-ACC Direktur (DISETUJUI) tapi belum ada surat jalan pabrik atau belum ada supir
  // 2. Draft / Planning yang masih belum diajukan
  const pendingOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === "DISETUJUI" && (!o.noDocPerusahaan?.trim() || !o.namaSupir?.trim())) {
        return true;
      }
      if (o.status === "DRAFT" || o.status === "PLANNING") {
        return true;
      }
      return false;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return pendingOrders;
    const q = searchQuery.toLowerCase();
    return pendingOrders.filter((o) => {
      const matchNo = (o.noSchedule || "").toLowerCase().includes(q);
      const matchToko = (o.namaToko || o.namaPenerima || "").toLowerCase().includes(q);
      const matchRute = (o.tujuanKirim || "").toLowerCase().includes(q);
      const matchDoc = (o.noDocPerusahaan || "").toLowerCase().includes(q);
      const matchSupir = (o.namaSupir || "").toLowerCase().includes(q);
      const matchPolisi = (o.noPolisiKendaraan || "").toLowerCase().includes(q);
      return matchNo || matchToko || matchRute || matchDoc || matchSupir || matchPolisi;
    });
  }, [pendingOrders, searchQuery]);

  const pagination = usePagination(filteredOrders, searchQuery);

  const totalUangJalan = useMemo(
    () => pendingOrders.reduce((sum, o) => sum + (Number(o.uangJalanSupir || 0)), 0),
    [pendingOrders]
  );
  const countAccReady = useMemo(
    () => pendingOrders.filter((o) => o.status === "DISETUJUI").length,
    [pendingOrders]
  );

  const openAttachModal = (order) => {
    setAttachModal({
      open: true,
      order,
      noDocPerusahaan: order.noDocPerusahaan || "",
      tglDocPerusahaan: order.tglDocPerusahaan || new Date().toISOString().slice(0, 10),
      namaSupir: order.namaSupir || "",
      noHpSupir: order.noHpSupir || "",
      keteranganDoc: order.keteranganDoc || "",
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
    if (!attachModal.tglDocPerusahaan) {
      setAttachModal((prev) => ({
        ...prev,
        error: "Tanggal Surat Jalan dari Perusahaan wajib diisi",
      }));
      return;
    }
    if (!attachModal.namaSupir.trim()) {
      setAttachModal((prev) => ({
        ...prev,
        error: "Nama supir yang bertugas wajib diisi",
      }));
      return;
    }

    setAttachModal((prev) => ({ ...prev, processing: true, error: null }));
    try {
      await attachDocPerusahaan(attachModal.order.id, {
        noDocPerusahaan: attachModal.noDocPerusahaan.trim(),
        tglDocPerusahaan: attachModal.tglDocPerusahaan,
        namaSupir: attachModal.namaSupir.trim(),
        noHpSupir: attachModal.noHpSupir.trim(),
        keteranganDoc: attachModal.keteranganDoc,
      });

      setAttachModal({
        open: false,
        order: null,
        noDocPerusahaan: "",
        tglDocPerusahaan: "",
        namaSupir: "",
        noHpSupir: "",
        keteranganDoc: "",
        processing: false,
        error: null,
      });
      await refresh();
    } catch (err) {
      setAttachModal((prev) => ({
        ...prev,
        processing: false,
        error: err instanceof Error ? err.message : "Gagal menyimpan surat jalan dan supir",
      }));
    }
  };

  const handleDeleteDraft = async (order) => {
    if (!window.confirm(`Hapus jadwal/rencana ${order.noSchedule || order.noDO}?`)) return;
    try {
      await remove(order.id);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus jadwal");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-amber-600" />
            Input Surat Jalan Pabrik & Supir
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Jadwal SO yang telah di-ACC oleh Direktur Utama dapat dilengkapi Nomor Surat Jalan Pabrik (No. DOC) dan Nama Supir sebelum armada diberangkatkan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => navigate("/dashboard/pengiriman")}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Truck size={14} />
            <span>+ Input SO Baru</span>
          </button>
        </div>
      </div>

      {/* Info Banner Alur */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck size={20} className="text-blue-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-blue-950">
            Alur Baru Operasional (ACC SO Terlebih Dahulu)
          </p>
          <p className="mt-0.5 text-blue-800">
            1. Admin mengajukan jadwal SO & uang jalan ke Direktur. &nbsp;•&nbsp; 
            2. Direktur memeriksa dan memberikan <strong>ACC SO</strong>. &nbsp;•&nbsp; 
            3. Pada halaman ini, lengkapi <strong>Surat Jalan Pabrik (No. DOC)</strong> dan <strong>Nama Supir</strong>. Setelah disimpan, status otomatis menjadi <strong>Dalam Pengiriman</strong>.
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              SO Sudah di-ACC Direktur
            </span>
            <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <ShieldCheck size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{countAccReady}</p>
          <p className="text-[11px] text-slate-500 mt-1">Siap dilengkapi surat jalan & supir</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Total Menunggu Input
            </span>
            <span className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <AlertTriangle size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{pendingOrders.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Rencana pengiriman belum berangkat</p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Total Uang Jalan Ter-ACC
            </span>
            <span className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
              <TrendingUp size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatRupiah(totalUangJalan)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Sesuai pengajuan uang jalan supir</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Main Table Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar SO Siap Dilengkapi Surat Jalan & Supir
            </h2>
            <p className="text-xs text-slate-500">
              Pilih order untuk mengisi nomor surat jalan pabrik Karawang dan nama supir yang bertugas.
            </p>
          </div>

          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari SO, Toko, Rute, Armada..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-slate-300 pl-8.5 pr-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none w-56 sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Memuat daftar rencana...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 size={44} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">
              Semua SO Sudah Dilengkapi Surat Jalan & Supir
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Tidak ada rencana yang tertahan. Seluruh armada siap jalan atau sedang dalam perjalanan.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard/pengiriman")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              + Input Pengajuan SO Baru
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">No. Schedule (SO)</th>
                    <th className="px-3 py-3">Toko / Depo Tujuan</th>
                    <th className="px-3 py-3">Rute & Tarif</th>
                    <th className="px-3 py-3">Armada Mobil</th>
                    <th className="px-3 py-3">Uang Jalan Supir</th>
                    <th className="px-3 py-3">Surat Jalan & Supir</th>
                    <th className="px-3 py-3">Status ACC</th>
                    <th className="px-3 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagination.items.map((order) => {
                    const hasDoc = order.noDocPerusahaan?.trim() && order.tglDocPerusahaan;
                    const hasSupir = Boolean(order.namaSupir?.trim());
                    const isAccDirektur = order.status === "DISETUJUI";

                    return (
                      <tr key={order.id} className="transition hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {order.noSchedule || "-"}
                          <p className="text-[10px] font-normal text-slate-400 font-sans mt-0.5">
                            {formatTanggal(order.tglSchedule || order.createdAt)}
                          </p>
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
                          <p className="text-slate-500 text-[11px]">
                            {formatRupiah(order.biayaEkspedisi ?? order.totalSetelahPPh ?? 0)}
                          </p>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          <p className="font-mono font-bold uppercase text-slate-900">
                            {order.noPolisiKendaraan || "-"}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            {order.tipeMobilRit || "-"}
                          </p>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="font-bold text-emerald-700 font-mono">
                            {order.uangJalanSupir ? formatRupiah(order.uangJalanSupir) : "-"}
                          </span>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            {hasDoc ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800 font-mono font-bold border border-emerald-200 text-[10px]">
                                <CheckCircle2 size={10} />
                                {order.noDocPerusahaan}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-red-700 font-medium border border-red-200 text-[10px]">
                                <AlertTriangle size={10} className="text-red-500" />
                                Belum Ada No. DOC
                              </span>
                            )}

                            <div>
                              {hasSupir ? (
                                <span className="text-[11px] font-semibold text-slate-700">
                                  Supir: {order.namaSupir}
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-700 font-medium">
                                  Supir: Belum Di-plot
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          {isAccDirektur ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                              <ShieldCheck size={11} />
                              ACC Direktur OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                              {order.status}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-lg bg-slate-100 p-1.5 text-slate-700 hover:bg-slate-200 transition"
                              title="Lihat Detail SO"
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openAttachModal(order)}
                              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition"
                              title="Input Surat Jalan Pabrik & Supir"
                            >
                              <FileText size={13} />
                              <span>Input SJ & Supir</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteDraft(order)}
                              className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition"
                              title="Hapus Rencana"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination {...pagination} onPageChange={pagination.setPage} />
          </>
        )}
      </div>

      {/* Modal Input Surat Jalan Pabrik & Supir */}
      {attachModal.open && (
        <Modal
          title="Input Surat Jalan Pabrik & Penugasan Supir"
          onClose={() => setAttachModal({ ...attachModal, open: false })}
          isOpen={attachModal.open}
        >
          <div className="space-y-4 text-xs">
            {/* Info Rangkuman SO yang sudah di-ACC */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Jadwal SO</span>
                  <p className="font-mono font-bold text-blue-900 text-sm">
                    {attachModal.order?.noSchedule || "-"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700">Uang Jalan Supir</span>
                  <p className="font-mono font-bold text-emerald-800 text-sm">
                    {formatRupiah(attachModal.order?.uangJalanSupir || 0)}
                  </p>
                </div>
              </div>

              <p>
                <strong className="text-slate-700">Toko / Depo:</strong>{" "}
                {attachModal.order?.namaToko || attachModal.order?.namaPenerima}
              </p>
              <p>
                <strong className="text-slate-700">Rute & Tujuan:</strong>{" "}
                {attachModal.order?.tujuanKirim}
              </p>
              <p>
                <strong className="text-slate-700">Armada Mobil:</strong>{" "}
                <span className="font-mono font-bold uppercase">{attachModal.order?.noPolisiKendaraan}</span>
                {" "}— {attachModal.order?.tipeMobilRit}
              </p>
            </div>

            {attachModal.error && (
              <div className="rounded-lg bg-red-50 p-2.5 text-red-700 flex items-center gap-1.5">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{attachModal.error}</span>
              </div>
            )}

            {/* Input Dokumen Pabrik */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Nomor Surat Jalan dari Pabrik / Dokumen (Karawang) *
              </label>
              <input
                type="text"
                placeholder="Contoh: 26001073074"
                value={attachModal.noDocPerusahaan}
                onChange={(e) =>
                  setAttachModal({ ...attachModal, noDocPerusahaan: e.target.value })
                }
                autoFocus
                required
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-xs font-bold uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Masukkan nomor fisik dokumen pengiriman yang dikeluarkan oleh pabrik GRC.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tanggal Dokumen Pabrik *
                </label>
                <input
                  type="date"
                  value={attachModal.tglDocPerusahaan}
                  onChange={(e) =>
                    setAttachModal({ ...attachModal, tglDocPerusahaan: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Dokumen (opsional)
                </label>
                <input
                  type="text"
                  placeholder="Keterangan surat jalan..."
                  value={attachModal.keteranganDoc}
                  onChange={(e) =>
                    setAttachModal({ ...attachModal, keteranganDoc: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Input Supir & No HP */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-3">
              <p className="font-bold text-amber-950 flex items-center gap-1.5">
                <User size={15} className="text-amber-700" />
                Penugasan Supir Armada
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Supir *
                  </label>
                  <input
                    type="text"
                    placeholder="Nama supir yang bertugas"
                    value={attachModal.namaSupir}
                    onChange={(e) =>
                      setAttachModal({ ...attachModal, namaSupir: e.target.value })
                    }
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. HP Supir (opsional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Nomor telepon supir"
                    value={attachModal.noHpSupir}
                    onChange={(e) =>
                      setAttachModal({ ...attachModal, noHpSupir: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                disabled={attachModal.processing}
                onClick={() => setAttachModal({ ...attachModal, open: false })}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={attachModal.processing}
                onClick={handleSaveDoc}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50 shadow-md"
              >
                <Send size={13} />
                <span>
                  {attachModal.processing ? "Menyimpan..." : "Simpan & Armada Berangkat"}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <DeliveryOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
