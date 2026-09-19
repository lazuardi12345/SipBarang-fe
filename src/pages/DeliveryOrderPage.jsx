"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeliveryOrders } from "../presentation/hooks/useDeliveryOrders";
import { CompanyDeliveryOrderForm } from "../presentation/components/delivery-order/CompanyDeliveryOrderForm";
import { ConsolidateRunPanel } from "../presentation/components/delivery-order/ConsolidateRunPanel";
import { DeliveryOrderDetailModal } from "../presentation/components/delivery-order/DeliveryOrderDetailModal";
import { StatusBadge } from "../presentation/components/ui/StatusBadge";
import { Modal } from "../presentation/components/ui/Modal";
import { formatRupiah, formatTanggal } from "../lib/format";
import {
  PlusCircle,
  ListFilter,
  Eye,
  RefreshCw,
  Truck,
  Send,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Layers
} from "lucide-react";

export default function DeliveryOrderPage() {
  const navigate = useNavigate();
  const { orders, loading, error, refresh, create, submitToDirector, consolidateRun } = useDeliveryOrders();
  const [activeTab, setActiveTab] = useState("input"); // 'input' | 'satu_jalan' | 'draft' | 'all'
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter for 'all' tab
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Ajukan ke Direktur
  const [submitModal, setSubmitModal] = useState({
    open: false,
    order: null,
    noDocPerusahaan: "",
    tglDocPerusahaan: new Date().toISOString().split("T")[0],
    keteranganDoc: "",
    error: null,
    processing: false,
  });

  // Batch selection for drafts
  const [selectedDraftIds, setSelectedDraftIds] = useState([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  const draftOrders = orders.filter(
    (o) => o.status === "DRAFT" || o.status === "PLANNING"
  );

  const filteredAllOrders = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = o.noDO?.toLowerCase().includes(q);
      const matchToko = (o.namaToko || o.namaPenerima || "").toLowerCase().includes(q);
      const matchDoc = (o.noDocPerusahaan || "").toLowerCase().includes(q);
      const matchSupir = (o.namaSupir || "").toLowerCase().includes(q);
      const matchTujuan = (o.tujuanKirim || "").toLowerCase().includes(q);
      return matchNo || matchToko || matchDoc || matchSupir || matchTujuan;
    }
    return true;
  });

  const handleCreateOrder = async (input) => {
    setSubmitting(true);
    try {
      await create(input);
      // If created as draft, switch to draft tab so user can see it in list
      if (input.status === "DRAFT") {
        setActiveTab("draft");
      } else {
        setActiveTab("all");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (order) => {
    setSubmitModal({
      open: true,
      order,
      noDocPerusahaan: order.noDocPerusahaan || "",
      tglDocPerusahaan: order.tglDocPerusahaan || new Date().toISOString().split("T")[0],
      keteranganDoc: order.keteranganDoc || "",
      error: null,
      processing: false,
    });
  };

  const handleConfirmSubmit = async () => {
    if (!submitModal.order) return;
    if (!submitModal.noDocPerusahaan || submitModal.noDocPerusahaan.trim() === "") {
      setSubmitModal((prev) => ({
        ...prev,
        error: "Nomor Dokumen / Surat Jalan dari Perusahaan wajib diisi untuk diajukan ke Direktur",
      }));
      return;
    }

    setSubmitModal((prev) => ({ ...prev, processing: true, error: null }));
    try {
      await submitToDirector(submitModal.order.id, {
        noDocPerusahaan: submitModal.noDocPerusahaan,
        tglDocPerusahaan: submitModal.tglDocPerusahaan,
        keteranganDoc: submitModal.keteranganDoc,
      });
      setSubmitModal({
        open: false,
        order: null,
        noDocPerusahaan: "",
        tglDocPerusahaan: "",
        keteranganDoc: "",
        error: null,
        processing: false,
      });
      await refresh();
    } catch (err) {
      setSubmitModal((prev) => ({
        ...prev,
        processing: false,
        error: err instanceof Error ? err.message : "Gagal mengajukan ke Direktur",
      }));
    }
  };

  const handleSelectAllDrafts = (e) => {
    if (e.target.checked) {
      setSelectedDraftIds(draftOrders.map((o) => o.id));
    } else {
      setSelectedDraftIds([]);
    }
  };

  const handleToggleDraftSelect = (id) => {
    setSelectedDraftIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchSubmit = async () => {
    if (selectedDraftIds.length === 0) return;
    if (
      !confirm(
        `Ajukan ${selectedDraftIds.length} pengiriman draft terpilih ke Direktur untuk di-ACC?`
      )
    ) {
      return;
    }

    setBatchProcessing(true);
    try {
      for (const id of selectedDraftIds) {
        await submitToDirector(id, {});
      }
      setSelectedDraftIds([]);
      await refresh();
    } catch (err) {
      alert("Ada pengiriman yang gagal diajukan: " + (err instanceof Error ? err.message : err));
    } finally {
      setBatchProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="text-blue-600" />
            Input & Manajemen Pengiriman
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Input rencana pengiriman, tampung draft, ajukan setelah surat jalan pabrik turun, hingga disetujui Direktur.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-200/80 p-1 self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("input")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
              activeTab === "input"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PlusCircle size={15} />
            Input Baru
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("satu_jalan")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
              activeTab === "satu_jalan"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers size={15} />
            <span>Satukan 1 Kali Jalan (Rit)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("draft")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
              activeTab === "draft"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText size={15} />
            <span>Draft List (Tunggu SJ)</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                activeTab === "draft" ? "bg-white/25 text-white" : "bg-amber-100 text-amber-800"
              }`}
            >
              {draftOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
              activeTab === "all"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListFilter size={15} />
            <span>Semua Pengiriman</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[11px] text-slate-600">
              {orders.length}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* TAB 1: FORM INPUT */}
      {activeTab === "input" && (
        <CompanyDeliveryOrderForm onSubmit={handleCreateOrder} submitting={submitting} />
      )}

      {/* TAB 2: SATUKAN 1 KALI JALAN (RIT ARMADA) */}
      {activeTab === "satu_jalan" && (
        <ConsolidateRunPanel
          orders={orders}
          onConsolidate={consolidateRun}
          loading={loading}
          onGoToApproval={() => navigate("/dashboard/approval")}
          onGoToDrafts={() => setActiveTab("draft")}
        />
      )}

      {/* TAB 2: DAFTAR DRAFT (TUNGGU SURAT JALAN) */}
      {activeTab === "draft" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">
                  Daftar Draft Pengiriman (Menunggu Surat Jalan Pabrik)
                </h2>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  {draftOrders.length} Draft
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Data input pengiriman disimpan di sini. Saat surat jalan dari pabrik sudah turun, klik{" "}
                <strong>&quot;Ajukan ke Direktur&quot;</strong> agar dapat di-ACC.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedDraftIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBatchSubmit}
                  disabled={batchProcessing}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  <Send size={13} />
                  Ajukan Terpilih ({selectedDraftIds.length}) ke Direktur
                </button>
              )}
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
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Memuat daftar draft...</div>
          ) : draftOrders.length === 0 ? (
            <div className="py-16 text-center">
              <FileCheck2 size={42} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada draft pengiriman tertunda</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Semua pengiriman sudah diajukan ke Direktur, atau belum ada input draft baru.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("input")}
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
                        onChange={handleSelectAllDrafts}
                        checked={
                          draftOrders.length > 0 && selectedDraftIds.length === draftOrders.length
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-0"
                      />
                    </th>
                    <th className="px-3 py-3">No. DO Ekspedisi</th>
                    <th className="px-3 py-3">Toko / Depo Tujuan</th>
                    <th className="px-3 py-3">Rute & Tarif</th>
                    <th className="px-3 py-3">Supir & Armada</th>
                    <th className="px-3 py-3">No. Dokumen Pabrik</th>
                    <th className="px-3 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {draftOrders.map((order) => {
                    const isSelected = selectedDraftIds.includes(order.id);
                    return (
                      <tr
                        key={order.id}
                        className={`transition hover:bg-slate-50/70 ${
                          isSelected ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleDraftSelect(order.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-slate-900">
                          {order.noDO}
                          <p className="text-[11px] font-normal text-slate-400 font-sans mt-0.5">
                            {formatTanggal(order.createdAt)}
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
                        <td className="px-3 py-3">
                          <p className="font-semibold text-blue-900">{order.tujuanKirim}</p>
                          <p className="text-emerald-700 font-bold text-[11px]">
                            {formatRupiah(order.totalSetelahPPh)}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-slate-800">{order.namaSupir}</p>
                          <p className="text-slate-500 uppercase font-mono text-[11px]">
                            {order.noPolisiKendaraan}
                          </p>
                        </td>
                        <td className="px-3 py-3 font-mono">
                          {order.noDocPerusahaan ? (
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800 font-semibold border border-emerald-200">
                              {order.noDocPerusahaan}
                            </span>
                          ) : (
                            <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700 border border-amber-200 text-[11px]">
                              Belum Turun (Draft)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openSubmitModal(order)}
                              className="flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700 shadow-xs transition"
                            >
                              <Send size={12} />
                              <span>Ajukan ke Direktur</span>
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
      )}

      {/* TAB 3: SEMUA PENGIRIMAN */}
      {activeTab === "all" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Semua Surat Jalan Pengiriman</h2>
              <p className="text-xs text-slate-500">Histori lengkap seluruh alur pengiriman ekspedisi.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Cari DO, Toko, Supir, Rute..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none w-48 sm:w-60"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">Semua Status ({orders.length})</option>
                <option value="DRAFT">Draft</option>
                <option value="MENUNGGU_ACC">Menunggu ACC Direktur</option>
                <option value="DISETUJUI">Disetujui (Berangkat)</option>
                <option value="MENUNGGU_KONFIRMASI">Menunggu ACC Terkirim</option>
                <option value="TERKIRIM">Selesai (Terkirim)</option>
                <option value="DITOLAK">Ditolak</option>
              </select>

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
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Memuat data pengiriman...</div>
          ) : filteredAllOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Truck size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada data yang sesuai filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">No. DO Ekspedisi</th>
                    <th className="px-4 py-3">Doc Pabrik / Toko</th>
                    <th className="px-4 py-3">Rute & Tujuan</th>
                    <th className="px-4 py-3">Supir & No Polisi</th>
                    <th className="px-4 py-3">Tagihan Bersih</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAllOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {order.noDO}
                        <p className="text-[11px] font-normal text-slate-400 font-sans mt-0.5">
                          {formatTanggal(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">
                          {order.namaToko || order.namaPenerima || "-"}
                        </p>
                        <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                          Doc: {order.noDocPerusahaan || "(Draft)"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-blue-900">{order.tujuanKirim}</p>
                        <p className="text-slate-500 text-[11px]">{order.areaDistribusi}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{order.namaSupir}</p>
                        <p className="text-slate-500 uppercase font-mono text-[11px]">
                          {order.noPolisiKendaraan}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {formatRupiah(order.totalSetelahPPh)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                          >
                            <Eye size={13} />
                            Detail
                          </button>
                          {(order.status === "DRAFT" || order.status === "PLANNING") && (
                            <button
                              type="button"
                              onClick={() => openSubmitModal(order)}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-600 transition"
                            >
                              <Send size={11} />
                              Ajukan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Ajukan ke Direktur (Input Surat Jalan Pabrik) */}
      {submitModal.open && (
        <Modal
          title="Ajukan Surat Jalan ke Direktur (ACC)"
          onClose={() => setSubmitModal({ ...submitModal, open: false })}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 space-y-1">
              <p>
                <strong className="text-blue-950">No. DO Ekspedisi:</strong>{" "}
                <span className="font-mono font-bold">{submitModal.order?.noDO}</span>
              </p>
              <p>
                <strong className="text-blue-950">Toko Tujuan:</strong>{" "}
                {submitModal.order?.namaToko || submitModal.order?.namaPenerima}
              </p>
              <p>
                <strong className="text-blue-950">Rute & Armada:</strong>{" "}
                {submitModal.order?.tujuanKirim} · Supir: {submitModal.order?.namaSupir} (
                {submitModal.order?.noPolisiKendaraan})
              </p>
            </div>

            {submitModal.error && (
              <div className="rounded-lg bg-red-50 p-2.5 text-red-700 flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{submitModal.error}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Dokumen / Surat Jalan dari Pabrik / Perusahaan *
              </label>
              <input
                type="text"
                placeholder="Contoh: 26001073074"
                value={submitModal.noDocPerusahaan}
                onChange={(e) =>
                  setSubmitModal({ ...submitModal, noDocPerusahaan: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Masukkan nomor surat jalan resmi yang telah diterbitkan dari pabrik/perusahaan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Dokumen Pabrik
                </label>
                <input
                  type="date"
                  value={submitModal.tglDocPerusahaan}
                  onChange={(e) =>
                    setSubmitModal({ ...submitModal, tglDocPerusahaan: e.target.value })
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
                  value={submitModal.keteranganDoc}
                  onChange={(e) =>
                    setSubmitModal({ ...submitModal, keteranganDoc: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                disabled={submitModal.processing}
                onClick={() => setSubmitModal({ ...submitModal, open: false })}
                className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitModal.processing}
                onClick={handleConfirmSubmit}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
              >
                <Send size={13} />
                {submitModal.processing ? "Mengajukan..." : "Ajukan ke Direktur"}
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
