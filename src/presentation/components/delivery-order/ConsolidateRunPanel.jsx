"use client";

import { useState, useMemo } from "react";
import { formatRupiah, formatTanggal } from "../../../lib/format";
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
  const [noSchedule, setNoSchedule] = useState(`S0794312/IX/${new Date().getFullYear()}`);
  const [tglSchedule, setTglSchedule] = useState(new Date().toISOString().split("T")[0]);
  const [tipeMobilRit, setTipeMobilRit] = useState("8 TON / Rit : 1");
  const [gudangAsal, setGudangAsal] = useState("GUDANG PUSAT - KARAWANG");
  const [noPolisiKendaraan, setNoPolisiKendaraan] = useState("");
  const [namaSupir, setNamaSupir] = useState("");
  const [noHpSupir, setNoHpSupir] = useState("");

  // Selected Order IDs
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusScope, setStatusScope] = useState("DRAFT_PLANNING"); // 'DRAFT_PLANNING' | 'ALL_ACTIVE'

  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Available orders for consolidation
  const availableOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusScope === "DRAFT_PLANNING") {
        if (o.status !== "DRAFT" && o.status !== "PLANNING") return false;
      } else {
        // Can consolidate any uncompleted orders
        if (o.status === "TERKIRIM" || o.status === "DITOLAK") return false;
      }

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
  }, [orders, statusScope, searchFilter]);

  // Selected items calculation
  const selectedOrders = useMemo(() => {
    return orders.filter((o) => selectedIds.includes(o.id));
  }, [orders, selectedIds]);

  const totalKoli = useMemo(() => {
    return selectedOrders.reduce((sum, o) => sum + (Number(o.jumlahKoli) || 0), 0);
  }, [selectedOrders]);

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

    if (!noPolisiKendaraan.trim() || !namaSupir.trim()) {
      setActionError("Nomor Polisi Armada dan Nama Supir wajib diisi untuk 1 kali jalan ini.");
      return;
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
              Pagi-pagi ketika truk armada diberangkatkan dari Karawang membawa muatan ke beberapa toko sekaligus,
              Anda dapat menyatukan inputan tujuan tersebut di sini.
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
              : "Data jadwal & armada telah diperbarui pada draft pengiriman terpilih. Anda dapat melengkapi surat jalan pabrik sebelum diajukan ke Direktur."}
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

      {/* Grid: Form Armada Jalan (Kiri) & Pilihan Pengiriman (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI (5 cols): Data Armada & Jadwal Rit */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 text-brand-dark font-semibold text-sm">
              <Truck size={18} className="text-blue-600" />
              <span>Data Armada & Jadwal (1 Kali Jalan)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gudang Asal</label>
                <input
                  type="text"
                  value={gudangAsal}
                  onChange={(e) => setGudangAsal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Schedule Pabrik</label>
                  <input
                    type="text"
                    value={noSchedule}
                    onChange={(e) => setNoSchedule(e.target.value)}
                    placeholder="S0794312/IX/2026"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tgl. Berangkat</label>
                  <input
                    type="date"
                    value={tglSchedule}
                    onChange={(e) => setTglSchedule(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Mobil / Rit</label>
                <input
                  type="text"
                  value={tipeMobilRit}
                  onChange={(e) => setTipeMobilRit(e.target.value)}
                  placeholder="8 TON / Rit : 1"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Polisi Armada *
                  </label>
                  <input
                    type="text"
                    placeholder="B 9482 KDA"
                    value={noPolisiKendaraan}
                    onChange={(e) => setNoPolisiKendaraan(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold uppercase focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Supir *</label>
                  <input
                    type="text"
                    placeholder="Nama Supir"
                    value={namaSupir}
                    onChange={(e) => setNamaSupir(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. HP Supir</label>
                <input
                  type="text"
                  placeholder="0812xxxx"
                  value={noHpSupir}
                  onChange={(e) => setNoHpSupir(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Summary Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs pt-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Ringkasan Muatan 1 Kali Jalan:
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Toko Tujuan Terpilih:</span>
                <span className="font-bold text-slate-900">{selectedOrders.length} Lokasi</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Muatan Barang:</span>
                <span className="font-bold text-purple-800">{totalKoli} Koli / Lembar</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Ekspedisi Bruto:</span>
                <span className="font-semibold text-slate-800">{formatRupiah(totalBruto)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-blue-950">
                <span>Total Tagihan Bersih:</span>
                <span className="font-black text-emerald-800">{formatRupiah(totalBersih)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={processing || selectedIds.length === 0}
                onClick={() => handleExecuteConsolidate(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-900 shadow-sm transition disabled:opacity-40"
              >
                <Save size={14} />
                <span>
                  {processing ? "Memproses..." : "1. Satukan ke Armada (Simpan Draft)"}
                </span>
              </button>

              <button
                type="button"
                disabled={processing || selectedIds.length === 0}
                onClick={() => handleExecuteConsolidate(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:from-amber-600 hover:to-amber-700 shadow-md transition disabled:opacity-40"
              >
                <Send size={14} />
                <span>
                  {processing ? "Memproses..." : "2. Satukan & Langsung Ajukan ke Direktur (ACC)"}
                </span>
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                * Direktur tetap memeriksa dan meng-ACC setiap tujuan secara individual.
              </p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (7 cols): Checklist Daftar Pengiriman untuk Disatukan */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Pilih Tujuan Pengiriman untuk 1 Kali Jalan Ini</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                    {availableOrders.length} Siap
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centang toko/tujuan yang akan diangkut oleh armada ini pagi ini.
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

              <select
                value={statusScope}
                onChange={(e) => setStatusScope(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="DRAFT_PLANNING">Hanya Draft & Planning</option>
                <option value="ALL_ACTIVE">Semua Pengiriman Aktif</option>
              </select>
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
                      onClick={() => toggleSelect(order.id)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition flex items-start gap-3 text-xs ${
                        isChecked
                          ? "border-blue-500 bg-blue-50/50 shadow-xs"
                          : "border-slate-200 hover:border-blue-200 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 pointer-events-none"
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
                          <span>
                            Muatan: <strong className="text-slate-700">{order.jumlahKoli || 0} Koli</strong> ({order.namaBarang || "-"})
                          </span>
                          <span>
                            Doc Pabrik:{" "}
                            {order.noDocPerusahaan ? (
                              <span className="font-mono font-semibold text-emerald-800">
                                {order.noDocPerusahaan}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-normal italic">
                                Belum turun (Draft)
                              </span>
                            )}
                          </span>
                        </div>
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
