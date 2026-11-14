import { useState, useMemo } from "react";
import { Truck, Plus, RefreshCw, Save, Pencil, Trash2, X, Search, Building2, User } from "lucide-react";
import { useKendaraan } from "../hooks/useKendaraan";

const EMPTY_FORM = {
  noPolisi: "",
  tipeMobil: "",
  kepemilikan: "MILIK_PRIBADI",
  namaPemilik: "",
  catatan: "",
};

export default function KendaraanPage() {
  const { kendaraanList, loading, createKendaraan, updateKendaraan, deleteKendaraan, reload } = useKendaraan();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [filterKepemilikan, setFilterKepemilikan] = useState("ALL"); // ALL | MILIK_PRIBADI | ORANG_LAIN

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setMessage(null);
  };

  const filteredKendaraans = useMemo(() => {
    return kendaraanList.filter((k) => {
      if (filterKepemilikan !== "ALL" && k.kepemilikan !== filterKepemilikan) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchPlat = (k.noPolisi || "").toLowerCase().includes(q);
        const matchTipe = (k.tipeMobil || "").toLowerCase().includes(q);
        const matchPemilik = (k.namaPemilik || "").toLowerCase().includes(q);
        return matchPlat || matchTipe || matchPemilik;
      }
      return true;
    });
  }, [kendaraanList, filterKepemilikan, search]);

  const countPribadi = useMemo(
    () => kendaraanList.filter((k) => k.kepemilikan === "MILIK_PRIBADI").length,
    [kendaraanList]
  );
  const countOrangLain = useMemo(
    () => kendaraanList.filter((k) => k.kepemilikan === "ORANG_LAIN").length,
    [kendaraanList]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const noPolisi = form.noPolisi.trim().toUpperCase();
    const tipeMobil = form.tipeMobil.trim();
    const kepemilikan = form.kepemilikan;
    const namaPemilik = kepemilikan === "ORANG_LAIN" ? form.namaPemilik.trim() : "";
    const catatan = form.catatan.trim();

    if (!noPolisi || !tipeMobil) {
      setMessage({ type: "error", text: "Plat nomor dan tipe mobil wajib diisi." });
      setSaving(false);
      return;
    }

    if (kepemilikan === "ORANG_LAIN" && !namaPemilik) {
      setMessage({ type: "error", text: "Nama pemilik / vendor wajib diisi jika kendaraan milik orang lain." });
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await updateKendaraan(editingId, {
          noPolisi,
          tipeMobil,
          kepemilikan,
          namaPemilik,
          catatan,
        });
        setMessage({ type: "success", text: "Data kendaraan berhasil diperbarui." });
      } else {
        await createKendaraan({
          noPolisi,
          tipeMobil,
          kepemilikan,
          namaPemilik,
          catatan,
        });
        setMessage({ type: "success", text: "Kendaraan berhasil ditambahkan ke master armada." });
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal menyimpan data kendaraan." });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (k) => {
    setEditingId(k.id);
    setForm({
      noPolisi: k.noPolisi || "",
      tipeMobil: k.tipeMobil || "",
      kepemilikan: k.kepemilikan || "MILIK_PRIBADI",
      namaPemilik: k.namaPemilik || "",
      catatan: k.catatan || "",
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
  };

  const handleDelete = async (id, plat) => {
    if (!window.confirm(`Hapus kendaraan dengan plat ${plat}?`)) return;

    try {
      await deleteKendaraan(id);
      if (editingId === id) {
        handleCancelEdit();
      }
      setMessage({ type: "success", text: "Kendaraan berhasil dihapus." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal menghapus kendaraan." });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Data Master</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Master Kendaraan / Armada</h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftarkan armada milik pribadi maupun milik orang lain (vendor/rekanan).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
            <Building2 size={13} /> {countPribadi} Milik Pribadi
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            <User size={13} /> {countOrangLain} Milik Orang Lain
          </span>
          <button
            onClick={() => reload()}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Form Tambah / Edit */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? "Perbarui Data Kendaraan" : "Tambah Kendaraan Baru"}
              </h2>
              <p className="text-xs text-slate-500">
                {editingId
                  ? "Ubah informasi plat nomor, jenis mobil, atau pemilik."
                  : "Daftarkan armada untuk memudahkan pemilihan saat membuat schedule pengiriman (SO)."}
              </p>
            </div>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              <X size={14} /> Batal Edit
            </button>
          )}
        </div>

        {message && (
          <div
            role="alert"
            className={`mb-5 rounded-xl border p-4 text-xs font-medium ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* No. Polisi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. Polisi / Plat Nomor *
              </label>
              <input
                type="text"
                value={form.noPolisi}
                onChange={update("noPolisi")}
                placeholder="Contoh: B 9482 KDA"
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm uppercase placeholder:font-sans focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Tipe Mobil */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipe Mobil / Jenis Truk *
              </label>
              <input
                type="text"
                value={form.tipeMobil}
                onChange={update("tipeMobil")}
                placeholder="Contoh: CDD Box, Fuso, Tronton, CDE"
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Kepemilikan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Kepemilikan *
              </label>
              <select
                value={form.kepemilikan}
                onChange={update("kepemilikan")}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
              >
                <option value="MILIK_PRIBADI">Milik Pribadi (PT Almira Yuniar Trek)</option>
                <option value="ORANG_LAIN">Milik Orang Lain (Vendor / Rekanan / Sewa)</option>
              </select>
            </div>

            {/* Nama Pemilik / Vendor (Muncul jika Milik Orang Lain) */}
            {form.kepemilikan === "ORANG_LAIN" && (
              <div className="md:col-span-2 lg:col-span-1 animate-fadeIn">
                <label className="block text-xs font-bold text-amber-800 mb-1">
                  Nama Pemilik / Vendor *
                </label>
                <input
                  type="text"
                  value={form.namaPemilik}
                  onChange={update("namaPemilik")}
                  placeholder="Contoh: Bpk. Budi / CV Maju Logistik"
                  required={form.kepemilikan === "ORANG_LAIN"}
                  className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </div>
            )}

            {/* Catatan */}
            <div className={form.kepemilikan === "ORANG_LAIN" ? "md:col-span-2" : "md:col-span-2 lg:col-span-3"}>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Armada (opsional)
              </label>
              <input
                type="text"
                value={form.catatan}
                onChange={update("catatan")}
                placeholder="Contoh: Tahun armada, kontak pemilik, masa uji KIR, dll."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {editingId ? <Save size={15} /> : <Plus size={15} />}
              {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan Kendaraan"}
            </button>
          </div>
        </form>
      </section>

      {/* Filter & List Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
          {/* Tabs Filter Kepemilikan */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterKepemilikan("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterKepemilikan === "ALL"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({kendaraanList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterKepemilikan("MILIK_PRIBADI")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterKepemilikan === "MILIK_PRIBADI"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pribadi ({countPribadi})
            </button>
            <button
              type="button"
              onClick={() => setFilterKepemilikan("ORANG_LAIN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterKepemilikan === "ORANG_LAIN"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Orang Lain ({countOrangLain})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari plat, tipe, pemilik..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3.5 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Memuat daftar kendaraan...</div>
        ) : filteredKendaraans.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            {search || filterKepemilikan !== "ALL"
              ? "Tidak ada kendaraan yang sesuai dengan filter pencarian."
              : "Belum ada kendaraan terdaftar. Silakan tambahkan kendaraan di form di atas."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">No. Polisi</th>
                  <th className="py-3 px-3">Tipe Mobil</th>
                  <th className="py-3 px-3">Kepemilikan</th>
                  <th className="py-3 px-3">Pemilik / Vendor</th>
                  <th className="py-3 px-3">Catatan</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKendaraans.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-sm text-slate-900 whitespace-nowrap">
                      {k.noPolisi}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {k.tipeMobil}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {k.kepemilikan === "MILIK_PRIBADI" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                          <Building2 size={11} /> Milik Pribadi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          <User size={11} /> Milik Orang Lain
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-medium">
                      {k.kepemilikan === "ORANG_LAIN" ? k.namaPemilik || "-" : "PT Almira Yuniar Trek"}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                      {k.catatan || "-"}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(k)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                          title="Edit Kendaraan"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(k.id, k.noPolisi)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                          title="Hapus Kendaraan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

