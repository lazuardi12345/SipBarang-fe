import { useMemo, useState } from "react";
import { CheckCircle2, MapPin, Truck, UserRound } from "lucide-react";
import { useTarif } from "../../hooks/useTarif";
import { formatRupiah } from "../../utils/format";

export function CompanyDeliveryOrderForm({ onSubmit, submitting }) {
  const { tarifList, loading: loadingTarif } = useTarif();
  const [form, setForm] = useState({
    namaToko: "",
    noHpPenerima: "",
    alamatLengkapTujuan: "",
    tarifId: "",
    noSchedule: "",
    tglSchedule: "",
    tipeMobilRit: "",
    noPolisiKendaraan: "",
    namaSupir: "",
    noHpSupir: "",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const tarifTerpilih = useMemo(
    () => tarifList.find((tarif) => tarif.id === form.tarifId),
    [tarifList, form.tarifId]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (
      !form.tarifId ||
      !form.namaToko.trim() ||
      !form.noSchedule.trim() ||
      !form.tglSchedule ||
      !form.tipeMobilRit.trim() ||
      !form.noPolisiKendaraan.trim() ||
      !form.namaSupir.trim()
    ) {
      setError("Tujuan, nama toko/depo, No. Schedule, tanggal, tipe mobil, No. Polisi, dan nama supir wajib diisi.");
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
        noSchedule: form.noSchedule.trim(),
        tglSchedule: form.tglSchedule,
        tipeMobilRit: form.tipeMobilRit.trim(),
        noPolisiKendaraan: form.noPolisiKendaraan.trim(),
        namaSupir: form.namaSupir.trim(),
        noHpSupir: form.noHpSupir.trim(),
        status: "DRAFT",
      });
      setSuccessMessage("Data tujuan, schedule, armada, dan supir berhasil disimpan. Rencana siap untuk proses selanjutnya.");
      setForm({
        namaToko: "",
        noHpPenerima: "",
        alamatLengkapTujuan: "",
        tarifId: "",
        noSchedule: "",
        tglSchedule: "",
        tipeMobilRit: "",
        noPolisiKendaraan: "",
        namaSupir: "",
        noHpSupir: "",
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal menyimpan rencana pengiriman");
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <MapPin size={20} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Data Tujuan & Rute</h2>
            <p className="text-xs text-slate-500">Isi tujuan pengiriman dan jadwal operasional utama.</p>
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
            Nama Toko / Depo Tujuan *
            <input
              type="text"
              value={form.namaToko}
              onChange={(event) => setForm((current) => ({ ...current, namaToko: event.target.value }))}
              placeholder="Contoh: T6246 - HEMAT"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            No. HP Toko / Penerima
            <input
              type="tel"
              value={form.noHpPenerima}
              onChange={(event) => setForm((current) => ({ ...current, noHpPenerima: event.target.value }))}
              placeholder="Nomor telepon penerima"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700 md:col-span-2">
            Alamat Lengkap Tujuan
            <textarea
              rows={2}
              value={form.alamatLengkapTujuan}
              onChange={(event) => setForm((current) => ({ ...current, alamatLengkapTujuan: event.target.value }))}
              placeholder="Alamat toko/depo tujuan"
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
              <span className="text-xs text-slate-500">Estimasi tarif ekspedisi</span>
              <p className="font-semibold text-slate-800">{formatRupiah(tarifTerpilih.total)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Truck size={20} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Data Supir & Armada</h2>
            <p className="text-xs text-slate-500">Schedule, armada, dan supir diinput di satu halaman agar lebih struktur.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-700">
            No. Schedule *
            <input
              type="text"
              value={form.noSchedule}
              onChange={(event) => setForm((current) => ({ ...current, noSchedule: event.target.value }))}
              placeholder="Nomor schedule"
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

          <label className="block text-xs font-semibold text-slate-700">
            Tipe Mobil / Rit *
            <input
              type="text"
              value={form.tipeMobilRit}
              onChange={(event) => setForm((current) => ({ ...current, tipeMobilRit: event.target.value }))}
              placeholder="Contoh: 8 Ton / Rit 1"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            No. Polisi Armada *
            <input
              type="text"
              value={form.noPolisiKendaraan}
              onChange={(event) => setForm((current) => ({ ...current, noPolisiKendaraan: event.target.value }))}
              placeholder="Contoh: B 9482 KDA"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Nama Supir *
            <input
              type="text"
              value={form.namaSupir}
              onChange={(event) => setForm((current) => ({ ...current, namaSupir: event.target.value }))}
              placeholder="Nama supir"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            No. HP Supir
            <input
              type="tel"
              value={form.noHpSupir}
              onChange={(event) => setForm((current) => ({ ...current, noHpSupir: event.target.value }))}
              placeholder="Nomor telepon supir"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex items-center gap-2 font-semibold">
          <UserRound size={16} />
          <span>Format alur baru</span>
        </div>
        <p className="mt-1 text-blue-800">
          Semua data utama seperti tujuan, schedule, armada, dan supir diisi di halaman ini agar alur pengiriman lebih terstruktur dan mudah diikuti.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting || loadingTarif}
        className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircle2 size={16} />
        {submitting ? "Menyimpan..." : "Simpan Rencana Pengiriman"}
      </button>
    </form>
  );
}
