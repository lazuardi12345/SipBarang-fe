import { useMemo, useState } from "react";
import { CheckCircle2, MapPin, Truck, UserRound, Building2, User, Send, DollarSign } from "lucide-react";
import { useTarif } from "../../hooks/useTarif";
import { useKendaraan } from "../../hooks/useKendaraan";
import { formatRupiah } from "../../utils/format";

export function CompanyDeliveryOrderForm({ onSubmit, submitting }) {
  const { tarifList, loading: loadingTarif } = useTarif();
  const { kendaraanList, loading: loadingKendaraan } = useKendaraan();

  const [form, setForm] = useState({
    namaToko: "",
    noHpPenerima: "",
    alamatLengkapTujuan: "",
    tarifId: "",
    noSchedule: "",
    tglSchedule: "",
    kendaraanId: "",
    tipeMobil: "",
    muatanTon: "8 Ton",
    rit: "Rit 1",
    noPolisiKendaraan: "",
    uangJalanSupir: "",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const tarifTerpilih = useMemo(
    () => tarifList.find((tarif) => tarif.id === form.tarifId),
    [tarifList, form.tarifId]
  );

  const selectedKendaraan = useMemo(
    () => kendaraanList.find((k) => k.id === form.kendaraanId),
    [kendaraanList, form.kendaraanId]
  );

  const handleSelectKendaraan = (event) => {
    const val = event.target.value;
    if (val === "MANUAL") {
      setForm((prev) => ({
        ...prev,
        kendaraanId: "MANUAL",
        noPolisiKendaraan: "",
        tipeMobil: "",
      }));
      return;
    }

    const found = kendaraanList.find((k) => k.id === val);
    if (found) {
      setForm((prev) => ({
        ...prev,
        kendaraanId: found.id,
        noPolisiKendaraan: found.noPolisi,
        tipeMobil: found.tipeMobil,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        kendaraanId: "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const noSchedule = form.noSchedule.trim();
    const tglSchedule = form.tglSchedule;
    const noPolisi = form.noPolisiKendaraan.trim().toUpperCase();
    const tipe = form.tipeMobil.trim() || "Truk";
    const muatan = form.muatanTon.trim() || "8 Ton";
    const rit = form.rit.trim() || "Rit 1";
    const tipeMobilRit = `${tipe} (${muatan}) / ${rit}`;

    if (!form.tarifId || !noSchedule || !tglSchedule) {
      setError("Tujuan, No. Schedule, dan Tanggal Schedule wajib diisi.");
      return;
    }

    if (!noPolisi) {
      setError("Armada kendaraan / plat nomor wajib dipilih atau diisi.");
      return;
    }

    if (form.uangJalanSupir === "" || Number(form.uangJalanSupir) < 0 || !Number.isFinite(Number(form.uangJalanSupir))) {
      setError("Uang jalan supir wajib diisi dengan nominal yang valid.");
      return;
    }

    try {
      await onSubmit({
        namaToko: form.namaToko.trim(),
        namaPenerima: form.namaToko.trim(),
        noHpPenerima: form.noHpPenerima.trim(),
        alamatLengkapTujuan: form.alamatLengkapTujuan.trim(),
        kota: tarifTerpilih?.tujuanKirim || "",
        tarifId: form.tarifId,
        noSchedule,
        tglSchedule,
        tipeMobilRit,
        noPolisiKendaraan: noPolisi,
        uangJalanSupir: Number(form.uangJalanSupir),
        namaSupir: "",
        noHpSupir: "",
        status: "MENUNGGU_ACC",
      });
      setSuccessMessage("Pengajuan SO dan Uang Jalan berhasil diajukan ke Direktur untuk di-ACC.");
      setForm({
        namaToko: "",
        noHpPenerima: "",
        alamatLengkapTujuan: "",
        tarifId: "",
        noSchedule: "",
        tglSchedule: "",
        kendaraanId: "",
        tipeMobil: "",
        muatanTon: "8 Ton",
        rit: "Rit 1",
        noPolisiKendaraan: "",
        uangJalanSupir: "",
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal mengajukan rencana SO");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Bagian 1: Data Tujuan & Rute */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <MapPin size={20} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Data Tujuan & Rute</h2>
            <p className="text-xs text-slate-500">Tentukan rute tujuan pengiriman dan toko penerima.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-700 md:col-span-2">
            Rute Tujuan Pengiriman *
            <select
              value={form.tarifId}
              onChange={(event) => setForm((current) => ({ ...current, tarifId: event.target.value }))}
              required
              disabled={loadingTarif}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">-- Pilih area dan tujuan kirim --</option>
              {tarifList.map((tarif) => (
                <option key={tarif.id} value={tarif.id}>
                  [{tarif.areaDistribusi}] {tarif.tujuanKirim} — {formatRupiah(tarif.total)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Nama Toko / Depo Tujuan (opsional)
            <input
              type="text"
              value={form.namaToko}
              onChange={(event) => setForm((current) => ({ ...current, namaToko: event.target.value }))}
              placeholder="Contoh: T6246 - HEMAT"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            No. HP Toko / Penerima (opsional)
            <input
              type="tel"
              value={form.noHpPenerima}
              onChange={(event) => setForm((current) => ({ ...current, noHpPenerima: event.target.value }))}
              placeholder="Nomor telepon penerima"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700 md:col-span-2">
            Alamat Tujuan (opsional)
            <textarea
              rows={2}
              value={form.alamatLengkapTujuan}
              onChange={(event) => setForm((current) => ({ ...current, alamatLengkapTujuan: event.target.value }))}
              placeholder={tarifTerpilih ? `Sementara: ${tarifTerpilih.tujuanKirim}` : "Alamat toko/depo tujuan"}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        {tarifTerpilih && (
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <span className="text-xs text-slate-500">Area distribusi</span>
              <p className="font-semibold text-slate-800">{tarifTerpilih.areaDistribusi} · {tarifTerpilih.tujuanKirim}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Tarif Bruto Ekspedisi</span>
              <p className="font-semibold text-slate-800">{formatRupiah(tarifTerpilih.total)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bagian 2: Data Pengajuan SO, Armada & Uang Jalan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Truck size={20} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Data Schedule, Armada & Uang Jalan Supir</h2>
            <p className="text-xs text-slate-500">
              Pengajuan SO dan Uang Jalan diajukan ke Direktur terlebih dahulu untuk mendapatkan ACC.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* No. Schedule & Tanggal */}
          <label className="block text-xs font-semibold text-slate-700">
            No. Schedule (SO) *
            <input
              type="text"
              value={form.noSchedule}
              onChange={(event) => setForm((current) => ({ ...current, noSchedule: event.target.value }))}
              placeholder="Contoh: SCH-202611-001"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Tanggal Schedule *
            <input
              type="date"
              value={form.tglSchedule}
              onChange={(event) => setForm((current) => ({ ...current, tglSchedule: event.target.value }))}
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {/* Pemilihan Kendaraan dari Master */}
          <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <label className="block text-xs font-bold text-slate-800">
              Pilih Kendaraan / Mobil *
              <select
                value={form.kendaraanId}
                onChange={handleSelectKendaraan}
                disabled={loadingKendaraan}
                className="mt-1.5 w-full rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">-- Pilih Armada dari Master Kendaraan --</option>
                {kendaraanList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.noPolisi} — {k.tipeMobil} ({k.kepemilikan === "MILIK_PRIBADI" ? "Milik Pribadi" : `Milik Rekanan: ${k.namaPemilik || "-"}`})
                  </option>
                ))}
                <option value="MANUAL">+ Input Manual / Belum Terdaftar di Master</option>
              </select>
            </label>

            {selectedKendaraan && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {selectedKendaraan.kepemilikan === "MILIK_PRIBADI" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                    <Building2 size={12} /> Milik Pribadi (PT Almira Yuniar Trek)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    <User size={12} /> Milik Rekanan / Vendor: {selectedKendaraan.namaPemilik || "-"}
                  </span>
                )}
                {selectedKendaraan.catatan && (
                  <span className="text-xs text-slate-500 italic">
                    ({selectedKendaraan.catatan})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Plat Nomor & Tipe Mobil */}
          <label className="block text-xs font-semibold text-slate-700">
            No. Polisi Armada (Plat Nomor) *
            <input
              type="text"
              value={form.noPolisiKendaraan}
              onChange={(event) => setForm((current) => ({ ...current, noPolisiKendaraan: event.target.value.toUpperCase() }))}
              placeholder="Contoh: B 9482 KDA"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm font-bold uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Tipe Mobil / Jenis Truk *
            <input
              type="text"
              value={form.tipeMobil}
              onChange={(event) => setForm((current) => ({ ...current, tipeMobil: event.target.value }))}
              placeholder="Contoh: CDD Box, Fuso, Tronton"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {/* Kapasitas Muatan & Rit */}
          <label className="block text-xs font-semibold text-slate-700">
            Kapasitas Muatan (Tonase) *
            <input
              type="text"
              value={form.muatanTon}
              onChange={(event) => setForm((current) => ({ ...current, muatanTon: event.target.value }))}
              placeholder="Contoh: 8 Ton / 5 Ton"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Rit Pengiriman *
            <input
              type="text"
              value={form.rit}
              onChange={(event) => setForm((current) => ({ ...current, rit: event.target.value }))}
              placeholder="Contoh: Rit 1, Rit 2"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {/* UANG JALAN SUPIR (Diisi di awal untuk di-ACC Direktur) */}
          <label className="block text-xs font-bold text-slate-800 md:col-span-2">
            Uang Jalan Supir (Diajukan ke Direktur) *
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-700">
                Rp
              </span>
              <input
                type="number"
                min="0"
                value={form.uangJalanSupir}
                onChange={(event) => setForm((current) => ({ ...current, uangJalanSupir: event.target.value }))}
                placeholder="Contoh: 500000"
                required
                className="w-full rounded-xl border border-emerald-300 bg-emerald-50/30 pl-11 pr-4 py-2.5 text-base font-black text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <span className="mt-1 block text-[11px] font-normal text-slate-500">
              Nominal uang jalan supir diajukan bersama jadwal SO ini untuk disetujui oleh Direktur Utama.
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
        <div className="flex items-center gap-2 font-bold mb-1">
          <UserRound size={16} />
          <span>Alur Penugasan Supir & Surat Jalan Pabrik</span>
        </div>
        <p>
          Setelah jadwal SO dan uang jalan ini disetujui (ACC) oleh Direktur Utama, Anda dapat melengkapi <strong>Nomor Surat Jalan Pabrik (No. DOC)</strong> dan <strong>Nama Supir serta No. HP</strong> di menu <em>Input SJ & Supir</em>.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting || loadingTarif}
        className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={16} />
        {submitting ? "Mengajukan SO..." : "Ajukan SO ke Direktur"}
      </button>
    </form>
  );
}
