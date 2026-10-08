"use client";

import { useState, useMemo } from "react";
import { formatRupiah, formatTanggal } from "../../utils/format";
import {
  Truck,
  CheckSquare,
  Square,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Package,
  MapPin,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

export function ConsolidateRunPanel({ orders, onConsolidate, loading, onGoToApproval, onGoToDrafts }) {
  // Form Data Armada & Schedule
  const [noSchedule, setNoSchedule] = useState("");
  const [tglSchedule, setTglSchedule] = useState("");
  const [tipeMobilRit, setTipeMobilRit] = useState("");
  const [gudangAsal, setGudangAsal] = useState("GUDANG PUSAT - KARAWANG");
  const [noPolisiKendaraan, setNoPolisiKendaraan] = useState("");
  const [namaSupir, setNamaSupir] = useState("");
  const [noHpSupir, setNoHpSupir] = useState("");

  // Selected Order IDs
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [documentsByOrder, setDocumentsByOrder] = useState({});

  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Available orders for consolidation
  const availableOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status !== "DRAFT" && o.status !== "PLANNING") return false;

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const mDO = (o.noDO || "").toLowerCase().includes(q);
        const mToko = (o.namaToko || o.namaPenerima || "").toLowerCase().includes(q);
        const mRute = (o.tujuanKirim || "").toLowerCase().includes(q);
        const mDoc = (o.noDocPerusahaan || "").toLowerCase().includes(q);
        return mDO || mToko || mRute || mDoc;
      }
      return true;
    });
  }, [orders, searchFilter]);

  // Selected items calculation
  const selectedOrders = useMemo(() => {
    return orders.filter((o) => selectedIds.includes(o.id));
  }, [orders, selectedIds]);

  const totalBruto = useMemo(() => {
    return selectedOrders.reduce(
      (sum, o) => sum + (Number(o.biayaEkspedisi ?? o.tarifPengiriman) || 0),
      0
    );
  }, [selectedOrders]);

  const totalBersih = useMemo(() => {
    return selectedOrders.reduce((sum, o) => sum + (Number(o.totalSetelahPPh) || 0), 0);
  }, [selectedOrders]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const updateDocument = (order, field, value) => {
    setDocumentsByOrder((prev) => ({
      ...prev,
      [order.id]: {
        noDocPerusahaan: prev[order.id]?.noDocPerusahaan ?? order.noDocPerusahaan ?? "",
        tglDocPerusahaan: prev[order.id]?.tglDocPerusahaan ?? order.tglDocPerusahaan ?? "",
        ...prev[order.id],
        [field]: value,
      },
    }));
  };

  const selectAll = () => {
    if (selectedIds.length === availableOrders.length && availableOrders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableOrders.map((o) => o.id));
    }
  };

  const handleExecuteConsolidate = async (submitToDirector = false) => {
    setActionError(null);
    setActionSuccess(null);

    if (selectedIds.length === 0) {
      setActionError("Pilih minimal 1 pengiriman / toko tujuan untuk disatukan dalam satu kali jalan.");
      return;
    }

    if (!noPolisiKendaraan.trim() || !namaSupir.trim() || !noSchedule.trim() || !tglSchedule || !tipeMobilRit.trim()) {
      setActionError("No. Schedule, tanggal, tipe mobil/rit, nomor polisi, dan nama supir wajib diisi.");
      return;
    }

    const orderDocumentData = {};
    for (const order of selectedOrders) {
      const document = documentsByOrder[order.id] || order;
      if (!document.noDocPerusahaan?.trim() || !document.tglDocPerusahaan) {
        setActionError(`No. Doc dan tanggal surat jalan perusahaan wajib diisi untuk ${order.namaToko || order.noDO}.`);
        return;
      }
      orderDocumentData[order.id] = {
        noDocPerusahaan: document.noDocPerusahaan.trim(),
        tglDocPerusahaan: document.tglDocPerusahaan,
        salesman: document.salesman ?? order.salesman ?? "",
        agen: document.agen ?? order.agen ?? "",
        kota: document.kota ?? order.kota ?? "",
        kecamatan: document.kecamatan ?? order.kecamatan ?? "",
        keteranganDoc: document.keteranganDoc ?? order.keteranganDoc ?? "",
      };
    }

    setProcessing(true);
    try {
      await onConsolidate({
        orderIds: selectedIds,
        noSchedule,
        tglSchedule,
        tipeMobilRit,
        gudangAsal,
        noPolisiKendaraan: noPolisiKendaraan.toUpperCase().trim(),
        namaSupir: namaSupir.trim(),
        noHpSupir: noHpSupir.trim(),
        orderDocumentData,
        submitToDirector,
      });

      const count = selectedIds.length;
      setSelectedIds([]);
      setActionSuccess({
        count,
        submitted: submitToDirector,
        armada: `${noPolisiKendaraan.toUpperCase()} (${namaSupir})`,
      });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal menyatukan pengiriman ke satu kali jalan"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Flow */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/30">
              <Layers size={13} />
              <span>Multi-Drop Delivery Trip</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Satukan Pengiriman ke 1 Kali Jalan (1 Rit Armada)
            </h2>
            <p className="text-xs text-blue-200/90 max-w-3xl leading-relaxed">
              Pagi-pagi ketika truk armada diberangkatkan dari Karawang untuk menjemput beberapa tujuan sekaligus,
              pilih rencana tujuan yang sudah diinput, lengkapi Schedule/Rit dan ketik No. Doc masing-masing dari surat jalan perusahaan.
              <strong className="text-white ml-1">
                Direktur tetap meng-ACC pengiriman satu per satu tujuan
              </strong>
              , dan saat pengiriman selesai invoice dapat digabungkan menjadi satu tagihan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs border border-white/15 text-center min-w-[120px]">
              <span className="text-[11px] text-blue-200 uppercase font-semibold block">
                Tujuan Dipilih
              </span>
              <span className="text-2xl font-black text-amber-300 font-mono">
                {selectedIds.length}
              </span>
              <span className="text-[10px] text-blue-200 block">Toko / Depo</span>
            </div>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span className="font-bold text-sm">
              Berhasil menyatukan {actionSuccess.count} tujuan pengiriman ke armada {actionSuccess.armada}!
            </span>
          </div>
          <p className="text-xs text-emerald-800">
            {actionSuccess.submitted
              ? "Semua tujuan terpilih telah diajukan ke Direktur. Direktur sekarang dapat meninjau dan meng-ACC satu per satu tujuan di halaman Approval."
              : "Schedule, armada, dan No. Doc perusahaan telah disimpan pada rencana terpilih. Rencana tetap berstatus draft sampai diajukan ke Direktur."}
          </p>
          <div className="pt-2 flex items-center gap-3">
            {actionSuccess.submitted ? (
              <button
                type="button"
                onClick={onGoToApproval}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                <span>Buka Menu ACC Direktur</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoToDrafts}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                <span>Lihat di Draft List</span>
                <ArrowRight size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-xs text-emerald-700 hover:underline"
            >
              Tutup Pesan
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Truck size={18} className="text-blue-600" />
          <span>Jadwal, armada, dan dokumen utama sudah dikelola di halaman pertama.</span>
        </div>
      </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Pilih Rencana & Lengkapi No. Doc per Tujuan</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                    {availableOrders.length} Siap
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih pengiriman yang tercantum di schedule. Ketik No. Doc dan tanggal sesuai surat jalan perusahaan untuk setiap tujuan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {selectedIds.length === availableOrders.length && availableOrders.length > 0 ? (
                    <>
                      <CheckSquare size={13} className="text-blue-600" />
                      <span>Batal Semua</span>
                    </>
                  ) : (
                    <>
                      <Square size={13} />
                      <span>Pilih Semua ({availableOrders.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Cari No DO, Toko, Rute, Doc Pabrik..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none flex-1"
              />

            </div>

            {/* List Order Cards */}
            {availableOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Truck size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">Tidak ada pengiriman yang sesuai filter</p>
                <p className="mt-1">
                  Silakan input pengiriman baru terlebih dahulu pada tab &quot;+ Input Baru&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {availableOrders.map((order) => {
                  const isChecked = selectedIds.includes(order.id);
                  return (
                    <div
                      key={order.id}
                      className={`rounded-xl border p-3.5 transition flex items-start gap-3 text-xs ${
                        isChecked
                          ? "border-blue-500 bg-blue-50/50 shadow-xs"
                          : "border-slate-200 hover:border-blue-200 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(order.id)}
                        aria-label={`Pilih ${order.namaToko || order.noDO}`}
                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0"
                      />

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {order.noDO}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatTanggal(order.createdAt)}
                            </span>
                          </div>
                          <span className="font-bold text-emerald-700 font-mono text-xs">
                            {formatRupiah(order.totalSetelahPPh)}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-semibold text-slate-900">
                            {order.namaToko || order.namaPenerima || "-"}
                          </p>
                          <span className="text-[11px] font-semibold text-blue-900">
                            [{order.areaDistribusi}] {order.tujuanKirim}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                          <span>Tujuan dipilih untuk pengiriman ini.</span>
                          {isChecked && (
                            <span className="text-blue-700 font-semibold">
                              Tujuan dipilih untuk schedule ini
                            </span>
                          )}
                        </div>
                        {isChecked && (
                          <div className="mt-3 grid grid-cols-1 gap-3 border-t border-blue-100 pt-3 sm:grid-cols-2" onClick={(event) => event.stopPropagation()}>
                            <label className="block">
                              <span className="mb-1 block font-semibold text-slate-700">No. Doc Surat Jalan Perusahaan *</span>
                              <input
                                type="text"
                                value={(documentsByOrder[order.id] || order).noDocPerusahaan || ""}
                                onChange={(event) => updateDocument(order, "noDocPerusahaan", event.target.value)}
                                placeholder="Ketik No. Doc dari dokumen perusahaan"
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block font-semibold text-slate-700">Tanggal Doc *</span>
                              <input
                                type="date"
                                value={(documentsByOrder[order.id] || order).tglDocPerusahaan || ""}
                                onChange={(event) => updateDocument(order, "tglDocPerusahaan", event.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block font-semibold text-slate-700">Salesman</span>
                              <input
                                type="text"
                                value={(documentsByOrder[order.id] || order).salesman || ""}
                                onChange={(event) => updateDocument(order, "salesman", event.target.value)}
                                placeholder="Nama salesman"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block font-semibold text-slate-700">Agen</span>
                              <input
                                type="text"
                                value={(documentsByOrder[order.id] || order).agen || ""}
                                onChange={(event) => updateDocument(order, "agen", event.target.value)}
                                placeholder="Agen"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block font-semibold text-slate-700">Kota / Kabupaten</span>
                              <input
                                type="text"
                                value={(documentsByOrder[order.id] || order).kota || ""}
                                onChange={(event) => updateDocument(order, "kota", event.target.value)}
                                placeholder="Kota / kabupaten"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block font-semibold text-slate-700">Kecamatan</span>
                              <input
                                type="text"
                                value={(documentsByOrder[order.id] || order).kecamatan || ""}
                                onChange={(event) => updateDocument(order, "kecamatan", event.target.value)}
                                placeholder="Kecamatan"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </label>
                            <label className="block sm:col-span-2">
                              <span className="mb-1 block font-semibold text-slate-700">Keterangan / Orderan Merchant</span>
                              <input
                                type="text"
                                value={(documentsByOrder[order.id] || order).keteranganDoc || ""}
                                onChange={(event) => updateDocument(order, "keteranganDoc", event.target.value)}
                                placeholder="Keterangan dari surat jalan perusahaan (opsional)"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
