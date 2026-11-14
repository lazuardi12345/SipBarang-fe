"use client";

import { useState, useMemo } from "react";
import { usePengeluaranLain } from "../hooks/usePengeluaranLain";
import { useAuth } from "../context/AuthContext";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { usePagination } from "../hooks/usePagination";
import { formatRupiah, formatTanggal } from "../utils/format";
import {
  Wallet,
  Plus,
  Search,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  Edit2,
  Trash2,
  AlertCircle,
  TrendingDown,
  Receipt,
  Layers,
  RefreshCw,
} from "lucide-react";

const KATEGORI_OPTIONS = [
  "Operasional",
  "Perbaikan & Servis",
  "Keperluan Kendaraan",
  "Kantor & Administrasi",
  "Konsumsi & Lembur",
  "Lainnya",
];

export default function PengeluaranLainPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedKategori, setSelectedKategori] = useState("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");

  const { items, loading, error, refresh, createItem, updateItem, removeItem } =
    usePengeluaranLain();

  // Modal State
  const [formModal, setFormModal] = useState({
    open: false,
    isEdit: false,
    id: null,
    tanggal: new Date().toISOString().slice(0, 10),
    nominal: "",
    kategori: "Operasional",
    keterangan: "",
    submitting: false,
    error: null,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    item: null,
    submitting: false,
  });

  // Filter items based on month, category, and search text
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedMonth && item.tanggal && !item.tanggal.startsWith(selectedMonth)) {
        return false;
      }
      if (selectedKategori !== "SEMUA" && item.kategori !== selectedKategori) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKet = (item.keterangan || "").toLowerCase().includes(q);
        const matchOleh = (item.dibuatOleh || "").toLowerCase().includes(q);
        const matchNom = String(item.nominal || "").includes(q);
        if (!matchKet && !matchOleh && !matchNom) return false;
      }
      return true;
    });
  }, [items, selectedMonth, selectedKategori, searchQuery]);

  const pagination = usePagination(filteredItems, `${selectedMonth}-${selectedKategori}-${searchQuery}`);

  // Summary Metrics
  const totalBulanIni = useMemo(() => {
    const curMonth = selectedMonth || new Date().toISOString().slice(0, 7);
    return items
      .filter((i) => i.tanggal && i.tanggal.startsWith(curMonth))
      .reduce((sum, i) => sum + Number(i.nominal || 0), 0);
  }, [items, selectedMonth]);

  const totalFiltered = useMemo(() => {
    return filteredItems.reduce((sum, i) => sum + Number(i.nominal || 0), 0);
  }, [filteredItems]);

  const totalSemua = useMemo(() => {
    return items.reduce((sum, i) => sum + Number(i.nominal || 0), 0);
  }, [items]);

  const handleOpenAdd = () => {
    setFormModal({
      open: true,
      isEdit: false,
      id: null,
      tanggal: new Date().toISOString().slice(0, 10),
      nominal: "",
      kategori: "Operasional",
      keterangan: "",
      submitting: false,
      error: null,
    });
  };

  const handleOpenEdit = (item) => {
    setFormModal({
      open: true,
      isEdit: true,
      id: item.id,
      tanggal: item.tanggal || new Date().toISOString().slice(0, 10),
      nominal: String(item.nominal || ""),
      kategori: item.kategori || "Operasional",
      keterangan: item.keterangan || "",
      submitting: false,
      error: null,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const nom = Number(formModal.nominal);
    if (!Number.isFinite(nom) || nom <= 0) {
      setFormModal((p) => ({ ...p, error: "Nominal harus berupa angka valid dan lebih dari 0" }));
      return;
    }
    if (!formModal.keterangan.trim()) {
      setFormModal((p) => ({ ...p, error: "Catatan peruntukan / keterangan pengeluaran wajib diisi" }));
      return;
    }

    setFormModal((p) => ({ ...p, submitting: true, error: null }));
    try {
      if (formModal.isEdit) {
        await updateItem(formModal.id, {
          tanggal: formModal.tanggal,
          nominal: nom,
          kategori: formModal.kategori,
          keterangan: formModal.keterangan.trim(),
        });
      } else {
        await createItem({
          tanggal: formModal.tanggal,
          nominal: nom,
          kategori: formModal.kategori,
          keterangan: formModal.keterangan.trim(),
        });
      }
      setFormModal((p) => ({ ...p, open: false, submitting: false }));
    } catch (err) {
      setFormModal((p) => ({
        ...p,
        submitting: false,
        error: err instanceof Error ? err.message : "Gagal menyimpan pengeluaran",
      }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    setDeleteModal((p) => ({ ...p, submitting: true }));
    try {
      await removeItem(deleteModal.item.id);
      setDeleteModal({ open: false, item: null, submitting: false });
    } catch (err) {
      alert("Gagal menghapus: " + (err instanceof Error ? err.message : "Kesalahan sistem"));
      setDeleteModal((p) => ({ ...p, submitting: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="text-red-600" />
            Pengeluaran Lain-Lain
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan pengeluaran biaya umum/global perusahaan (nominal berapa dan untuk apa).
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
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
          >
            <Plus size={16} />
            <span>+ Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              Total Bulan Ini ({selectedMonth || "Semua"})
            </span>
            <span className="rounded-xl bg-red-100 p-2 text-red-700">
              <TrendingDown size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900 leading-none">
            {formatRupiah(totalBulanIni)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Pengeluaran operasional pada periode bulan ini
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Total Hasil Filter
            </span>
            <span className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <Receipt size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900 leading-none">
            {formatRupiah(totalFiltered)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Dari {filteredItems.length} transaksi yang ditampilkan
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Total Seluruh Catatan
            </span>
            <span className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <Layers size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900 leading-none">
            {formatRupiah(totalSemua)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Akumulasi keseluruhan ({items.length} catatan)
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Filter Bulan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Filter Bulan
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-red-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Filter Kategori */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Kategori Pengeluaran
            </label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-red-500 focus:bg-white focus:outline-none"
            >
              <option value="SEMUA">Semua Kategori</option>
              {KATEGORI_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Pencarian (Untuk Apa / Keterangan)
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari keterangan atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Memuat data pengeluaran lain-lain...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <Wallet size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              Belum ada catatan pengeluaran pada periode ini
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Klik tombol "+ Catat Pengeluaran" untuk menambahkan catatan baru.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Untuk Apa / Keterangan</th>
                    <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                    <th className="py-3 px-4">Dicatat Oleh</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagination.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {formatTanggal(item.tanggal)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {item.kategori || "Lainnya"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="font-semibold text-slate-900 leading-snug">
                          {item.keterangan}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-red-600 whitespace-nowrap text-sm">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {item.dibuatOleh || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                            title="Edit Pengeluaran"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, item, submitting: false })}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                            title="Hapus Pengeluaran"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200">
              <Pagination {...pagination} onPageChange={pagination.setPage} />
            </div>
          </>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {formModal.open && (
        <Modal
          title={formModal.isEdit ? "Edit Catatan Pengeluaran" : "Catat Pengeluaran Baru"}
          onClose={() => setFormModal((p) => ({ ...p, open: false }))}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {formModal.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formModal.error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tanggal */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Pengeluaran *
                </label>
                <input
                  type="date"
                  value={formModal.tanggal}
                  onChange={(e) => setFormModal((p) => ({ ...p, tanggal: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori *
                </label>
                <select
                  value={formModal.kategori}
                  onChange={(e) => setFormModal((p) => ({ ...p, kategori: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                >
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nominal */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Berapa Pengeluarannya (Nominal Rp) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  Rp
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Contoh: 150000"
                  value={formModal.nominal}
                  onChange={(e) => setFormModal((p) => ({ ...p, nominal: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm font-bold text-slate-900 focus:border-red-500 focus:outline-none"
                />
              </div>
              {formModal.nominal && Number(formModal.nominal) > 0 && (
                <p className="text-[11px] text-red-600 font-bold mt-1">
                  Terbaca: {formatRupiah(Number(formModal.nominal))}
                </p>
              )}
            </div>

            {/* Untuk Apa (Keterangan) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Untuk Apa Pengeluarannya (Keterangan) *
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan peruntukan pengeluaran, contoh: Beli oli mesin truk, perbaikan ban di tol, beli kertas & ATK kasir, cuci mobil, dll."
                value={formModal.keterangan}
                onChange={(e) => setFormModal((p) => ({ ...p, keterangan: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                disabled={formModal.submitting}
                onClick={() => setFormModal((p) => ({ ...p, open: false }))}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={formModal.submitting}
                className="rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {formModal.submitting ? "Menyimpan..." : formModal.isEdit ? "Simpan Perubahan" : "Catat Pengeluaran"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Delete Confirmation */}
      {deleteModal.open && (
        <Modal
          title="Konfirmasi Hapus Pengeluaran"
          onClose={() => setDeleteModal({ open: false, item: null, submitting: false })}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700">
              Apakah Anda yakin ingin menghapus catatan pengeluaran berikut?
            </p>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-1">
              <p>
                <strong>Tanggal:</strong> {formatTanggal(deleteModal.item?.tanggal)}
              </p>
              <p>
                <strong>Kategori:</strong> {deleteModal.item?.kategori}
              </p>
              <p>
                <strong>Untuk Apa:</strong> {deleteModal.item?.keterangan}
              </p>
              <p>
                <strong>Nominal:</strong>{" "}
                <span className="font-bold text-red-700">
                  {formatRupiah(deleteModal.item?.nominal)}
                </span>
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                disabled={deleteModal.submitting}
                onClick={() => setDeleteModal({ open: false, item: null, submitting: false })}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteModal.submitting}
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteModal.submitting ? "Menghapus..." : "Hapus Pengeluaran"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

