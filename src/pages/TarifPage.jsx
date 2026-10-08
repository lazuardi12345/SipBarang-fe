import { useState } from "react";
import { MapPinned, Plus, RefreshCw, Save, Pencil, Trash2, X } from "lucide-react";
import { useTarif } from "../hooks/useTarif";
import { formatRupiah } from "../utils/format";

const EMPTY_FORM = {
  areaDistribusi: "",
  tujuanKirim: "",
  total: "",
  totalSetelahPPh: "",
};

export default function TarifPage() {
  const { tarifList, loading, createTarif, updateTarif, deleteTarif } = useTarif();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const total = Number(form.total || 0);
    const totalSetelahPPh = Number(form.totalSetelahPPh || total || 0);

    try {
      if (editingId) {
        await updateTarif(editingId, {
          ...form,
          total,
          totalSetelahPPh,
        });
        setMessage({ type: "success", text: "Perubahan tarif berhasil disimpan." });
      } else {
        await createTarif({
          ...form,
          total,
          totalSetelahPPh,
        });
        setMessage({ type: "success", text: "Tujuan baru berhasil ditambahkan." });
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal menyimpan master tujuan." });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tarif) => {
    setEditingId(tarif.id);
    setForm({
      areaDistribusi: tarif.areaDistribusi || "",
      tujuanKirim: tarif.tujuanKirim || "",
      total: tarif.total ?? "",
      totalSetelahPPh: tarif.totalSetelahPPh ?? tarif.total ?? "",
    });
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
  };

  const handleDelete = async (tarifId) => {
    if (!window.confirm("Hapus master tujuan ini?")) return;

    try {
      await deleteTarif(tarifId);
      if (editingId === tarifId) {
        handleCancelEdit();
      }
      setMessage({ type: "success", text: "Master tujuan berhasil dihapus." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal menghapus master tujuan." });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Data Master</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Master Tujuan & Tarif</h1>
          <p className="mt-1 text-sm text-slate-500">Tambahkan tujuan pengiriman yang dapat dipilih saat membuat DO.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <MapPinned size={16} className="text-blue-600" />
          {tarifList.length} tujuan terdaftar
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Plus size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">{editingId ? "Edit Tujuan" : "Tambah Tujuan Baru"}</h2>
            <p className="text-xs text-slate-500">Data ini akan langsung tersedia di form input pengiriman.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-bold text-slate-600">
            Area Distribusi
            <input required value={form.areaDistribusi} onChange={update("areaDistribusi")} placeholder="Contoh: Jawa Barat" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Tujuan Kirim
            <input required value={form.tujuanKirim} onChange={update("tujuanKirim")} placeholder="Contoh: Bandung" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Tarif Bruto
            <input required min="0" type="number" value={form.total} onChange={update("total")} placeholder="0" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Uang Jalan Supir
            <input min="0" type="number" value={form.totalSetelahPPh || form.total} onChange={update("totalSetelahPPh")} placeholder="0" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-4 xl:flex-row xl:items-center xl:justify-between">
            {message ? <p className={`text-sm font-semibold ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p> : <span />}
            <div className="flex items-center gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  <X size={16} />
                  Batal
                </button>
              )}
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={16} />
                {saving ? "Menyimpan..." : editingId ? "Update Tujuan" : "Simpan Tujuan"}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">Daftar Tujuan</h2>
            <p className="text-xs text-slate-500">Master tarif dari database real.</p>
          </div>
          <RefreshCw size={17} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-bold">Area</th>
                <th className="px-5 py-3 font-bold">Tujuan</th>
                <th className="px-5 py-3 text-right font-bold">Tarif Bruto</th>
                <th className="px-5 py-3 text-right font-bold">Uang Jalan Supir</th>
                <th className="px-5 py-3 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tarifList.map((tarif) => (
                <tr key={tarif.id} className="text-slate-700">
                  <td className="px-5 py-3">{tarif.areaDistribusi}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{tarif.tujuanKirim}</td>
                  <td className="px-5 py-3 text-right">{formatRupiah(tarif.total)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatRupiah(tarif.totalSetelahPPh ?? tarif.total ?? 0)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(tarif)}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tarif.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={12} />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && tarifList.length === 0 && (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">Belum ada master tujuan. Tambahkan tujuan pertama di atas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}