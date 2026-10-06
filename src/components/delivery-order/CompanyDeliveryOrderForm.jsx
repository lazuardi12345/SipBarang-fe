import { useMemo, useState } from "react";
import { CheckCircle2, MapPin, Package, Plus, Trash2 } from "lucide-react";
import { useTarif } from "../../hooks/useTarif";
import { formatRupiah } from "../../utils/format";

const EMPTY_ITEM = { namaBarang: "", jumlah: 1, satuan: "Karung", hargaSatuan: 0 };

export function CompanyDeliveryOrderForm({ onSubmit, submitting }) {
  const { tarifList, loading: loadingTarif } = useTarif();
  const [form, setForm] = useState({
    namaToko: "",
    noHpPenerima: "",
    alamatLengkapTujuan: "",
    tarifId: "",
    itemsBarang: [{ ...EMPTY_ITEM }],
    beratBarangKg: "",
    catatanBarang: "",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const tarifTerpilih = useMemo(
    () => tarifList.find((tarif) => tarif.id === form.tarifId),
    [tarifList, form.tarifId]
  );
  const totalKarung = form.itemsBarang.reduce(
    (total, item) => total + (Number(item.jumlah) || 0),
    0
  );
  const totalNilaiBarang = form.itemsBarang.reduce(
    (total, item) => total + (Number(item.jumlah) || 0) * (Number(item.hargaSatuan) || 0),
    0
  );

  const updateItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      itemsBarang: current.itemsBarang.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const itemsBarang = form.itemsBarang.filter(
      (item) => item.namaBarang.trim() && Number(item.jumlah) > 0
    );
    if (!form.tarifId || !form.namaToko.trim() || itemsBarang.length === 0) {
      setError("Tujuan, nama toko/depo, dan minimal satu rincian barang wajib diisi.");
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
        itemsBarang,
        namaBarang: itemsBarang
          .map((item) => `${item.namaBarang} (${item.jumlah} ${item.satuan || "Karung"})`)
          .join(", "),
        jumlahKoli: itemsBarang.reduce((total, item) => total + Number(item.jumlah), 0),
        totalNilaiBarang,
        beratBarangKg: Number(form.beratBarangKg) || 0,
        catatanBarang: form.catatanBarang.trim(),
        status: "DRAFT",
      });
      setSuccessMessage(
        "Rencana tersimpan. Pada langkah 2, pilih rencana ini untuk mengisi schedule/rit dan No. Doc sesuai surat jalan perusahaan."
      );
      setForm({
        namaToko: "",
        noHpPenerima: "",
        alamatLengkapTujuan: "",
        tarifId: "",
        itemsBarang: [{ ...EMPTY_ITEM }],
        beratBarangKg: "",
        catatanBarang: "",
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
            <h2 className="font-bold text-slate-900">Langkah 1: Rencana Tujuan</h2>
            <p className="text-xs text-slate-500">Catat tujuan dan muatan yang akan dikirim.</p>
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
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <Package size={20} />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Rincian Barang</h2>
              <p className="text-xs text-slate-500">Tambahkan semua jenis barang dan jumlah karung.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm((current) => ({
              ...current,
              itemsBarang: [...current.itemsBarang, { ...EMPTY_ITEM }],
            }))}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <Plus size={15} />
            Tambah barang
          </button>
        </div>

        <div className="space-y-3">
          {form.itemsBarang.map((item, index) => (
            <div key={index} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-12 sm:items-end">
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-5">
                Nama barang *
                <input
                  type="text"
                  value={item.namaBarang}
                  onChange={(event) => updateItem(index, "namaBarang", event.target.value)}
                  placeholder="Contoh: Beras premium"
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-blue-500 focus:outline-none"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                Jumlah *
                <input
                  type="number"
                  min="1"
                  value={item.jumlah}
                  onChange={(event) => updateItem(index, "jumlah", Number(event.target.value))}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                Satuan
                <input
                  type="text"
                  value={item.satuan}
                  onChange={(event) => updateItem(index, "satuan", event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-blue-500 focus:outline-none"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                Harga / satuan
                <input
                  type="number"
                  min="0"
                  value={item.hargaSatuan || ""}
                  onChange={(event) => updateItem(index, "hargaSatuan", Number(event.target.value) || 0)}
                  placeholder="Opsional"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-blue-500 focus:outline-none"
                />
              </label>
              <div className="flex justify-end sm:col-span-1">
                <button
                  type="button"
                  disabled={form.itemsBarang.length === 1}
                  onClick={() => setForm((current) => ({
                    ...current,
                    itemsBarang: current.itemsBarang.filter((_, itemIndex) => itemIndex !== index),
                  }))}
                  aria-label={`Hapus barang ${index + 1}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-700">
            Berat total (kg)
            <input
              type="number"
              min="0"
              value={form.beratBarangKg}
              onChange={(event) => setForm((current) => ({ ...current, beratBarangKg: event.target.value }))}
              placeholder="Opsional"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Catatan barang
            <input
              type="text"
              value={form.catatanBarang}
              onChange={(event) => setForm((current) => ({ ...current, catatanBarang: event.target.value }))}
              placeholder="Opsional"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-blue-500 focus:outline-none"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
          <span className="font-semibold text-slate-600">Total muatan: <strong className="text-purple-800">{totalKarung} karung</strong></span>
          <span className="font-semibold text-slate-600">Total nilai barang: <strong className="text-emerald-800">{formatRupiah(totalNilaiBarang)}</strong></span>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">Langkah 1 dari 2</p>
        <p className="mt-1 text-blue-800">
          Rencana disimpan terlebih dahulu. Pada langkah 2, pilih rencana ini untuk mengisi No. Schedule, rit/armada, dan No. Doc yang diketik sesuai surat jalan perusahaan. No. Doc wajib sebelum pengajuan ke Direktur.
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
