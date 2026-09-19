import { useState } from "react";
import { useDeliveryOrders } from "../hooks/useDeliveryOrders";
import { useInvoices } from "../hooks/useInvoices";
import { Modal } from "../components/ui/Modal";
import { formatRupiah, formatTanggal, formatTanggalWaktu } from "../utils/format";
import {
  FileText,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
  Printer,
  Search,
  CheckSquare,
  Square,
  Truck,
  Building2,
  Send
} from "lucide-react";
import { InvoiceOfficialView } from "../components/invoice/InvoiceOfficialView";

const STATUS_INVOICE_COLORS = {
  BELUM_DIBAYAR: { text: "text-amber-700", bg: "bg-amber-100", label: "Belum Dibayar" },
  BELUM_LUNAS: { text: "text-amber-700", bg: "bg-amber-100", label: "Belum Lunas" },
  LUNAS: { text: "text-emerald-700", bg: "bg-emerald-100", label: "Lunas" },
  DIBATALKAN: { text: "text-red-700", bg: "bg-red-100", label: "Dibatalkan" },
};

function StatusBadgeInvoice({ status }) {
  const s = STATUS_INVOICE_COLORS[status] || {
    text: "text-slate-700",
    bg: "bg-slate-100",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

function CreateInvoiceModal({ deliveredOrders, onSubmit, onClose }) {
  const [namaPelanggan, setNamaPelanggan] = useState("PT GRC BOARD INDONESIA");
  const [alamatPelanggan, setAlamatPelanggan] = useState(
    "Kawasan Industri KIIC, Jl. Maligi Raya Lot Q-2A, Karawang Barat"
  );
  const [noPoCustomer, setNoPoCustomer] = useState("");
  const [selected, setSelected] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    if (selected.length === deliveredOrders.length) {
      setSelected([]);
    } else {
      setSelected(deliveredOrders.map((o) => o.id));
    }
  }

  const filteredDelivered = deliveredOrders.filter((o) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      o.noDO?.toLowerCase().includes(q) ||
      (o.namaToko || o.namaPenerima || "").toLowerCase().includes(q) ||
      o.tujuanKirim?.toLowerCase().includes(q) ||
      o.namaSupir?.toLowerCase().includes(q) ||
      o.noDocPerusahaan?.toLowerCase().includes(q)
    );
  });


  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (selected.length === 0) {
      setError("Pilih minimal satu pengiriman (Surat Jalan) untuk digabungkan ke Invoice");
      return;
    }

    if (!namaPelanggan.trim()) {
      setError("Nama Pelanggan / Perusahaan wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        namaPelanggan,
        alamatPelanggan,
        noPoCustomer,
        deliveryOrderIds: selected,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Identitas Pelanggan & Penagihan */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 size={14} className="text-blue-700" />
            Identitas Pelanggan yang Ditagih (Customer)
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setNamaPelanggan("PT GRC BOARD INDONESIA");
                setAlamatPelanggan(
                  "Kawasan Industri KIIC, Jl. Maligi Raya Lot Q-2A, Karawang Barat"
                );
              }}
              className="text-[10px] font-semibold text-blue-700 hover:underline bg-white border border-slate-200 px-2 py-0.5 rounded-md"
            >
              PT GRC BOARD
            </button>
            <button
              type="button"
              onClick={() => {
                setNamaPelanggan("PT BANGUN PERKASA JAYA");
                setAlamatPelanggan("Jl. Raya Subang - Cikampek Km. 12");
              }}
              className="text-[10px] font-semibold text-slate-700 hover:underline bg-white border border-slate-200 px-2 py-0.5 rounded-md"
            >
              PT Bangun Perkasa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Perusahaan / Pelanggan *
            </label>
            <input
              required
              value={namaPelanggan}
              onChange={(e) => setNamaPelanggan(e.target.value)}
              placeholder="Contoh: PT GRC BOARD INDONESIA"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor PO / Kontrak Pelanggan (Opsional)
            </label>
            <input
              value={noPoCustomer}
              onChange={(e) => setNoPoCustomer(e.target.value)}
              placeholder="Contoh: PO/GRC/2026/0998"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Penagihan
            </label>
            <input
              value={alamatPelanggan}
              onChange={(e) => setAlamatPelanggan(e.target.value)}
              placeholder="Alamat kantor atau pabrik pelanggan"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bagian Pilih Multi Surat Jalan */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Pilih Pengiriman yang Ingin Digabungkan ke Invoice (Status: Terkirim) *
            </p>
            <p className="text-[11px] text-slate-500">
              Centang beberapa surat jalan di bawah untuk menghasilkan 1 invoice gabungan.
            </p>
          </div>

          {deliveredOrders.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
              >
                {selected.length === deliveredOrders.length ? (
                  <>
                    <Square size={13} />
                    <span>Batal Pilih Semua</span>
                  </>
                ) : (
                  <>
                    <CheckSquare size={13} />
                    <span>Pilih Semua ({deliveredOrders.length} DO)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Search filter in modal if list is large */}
        {deliveredOrders.length > 3 && (
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter No. DO, Toko, Supir..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {deliveredOrders.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-xs text-amber-800">
            <Truck size={36} className="mx-auto text-amber-500 mb-2 opacity-70" />
            <p className="font-bold text-sm">Belum ada pengiriman berstatus TERKIRIM</p>
            <p className="mt-1 text-slate-600">
              Pengiriman baru bisa dibuatkan invoice setelah supir lapor terkirim dan telah di-ACC konfirmasi oleh Direktur.
            </p>
          </div>
        ) : filteredDelivered.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Tidak ada pengiriman yang sesuai dengan kata kunci pencarian.
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white shadow-inner">
            {filteredDelivered.map((o) => {
              const isChecked = selected.includes(o.id);
              return (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-start justify-between gap-3 p-3 text-xs transition select-none ${
                    isChecked ? "bg-blue-50/70" : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0 accent-blue-600 h-4 w-4 shrink-0"
                      checked={isChecked}
                      onChange={() => toggle(o.id)}
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{o.noDO}</span>
                        {o.noDocPerusahaan && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] text-slate-600">
                            SJ Pabrik: {o.noDocPerusahaan}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800 truncate">
                        {o.namaToko || o.namaPenerima} — [{o.areaDistribusi}] {o.tujuanKirim}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Supir: {o.namaSupir} ({o.noPolisiKendaraan}) · Tgl Kirim: {formatTanggal(o.tanggalKirim)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-extrabold text-emerald-700 block text-xs">
                      {formatRupiah(o.totalSetelahPPh)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Bruto: {formatRupiah(o.biayaEkspedisi || 0)}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>


      {/* Tombol Aksi */}
      <div className="flex gap-2 justify-end pt-2 border-t">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting || selected.length === 0 || !namaPelanggan.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
        >
          <Receipt size={15} />
          {submitting
            ? "Menerbitkan Faktur..."
            : `Gabungkan & Buat Invoice (${selected.length} DO)`}
        </button>
      </div>
    </form>
  );
}

export default function InvoicePage() {
  const { orders } = useDeliveryOrders();
  const { invoices, loading, error, refresh, generate, updateStatus } = useInvoices();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Hanya DO yang sudah berstatus TERKIRIM
  const deliveredOrders = orders.filter((o) => o.status === "TERKIRIM");

  const handleGenerate = async (input) => {
    await generate(input);
    setShowCreate(false);
  };

  const handleUpdateStatus = async (invoice, status) => {
    if (!window.confirm(`Ubah status invoice ${invoice.noInvoice} menjadi ${status}?`)) return;
    await updateStatus(invoice.id, status);
    setSelectedInvoice(null);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredInvoices = invoices.filter((inv) => {
    const matchStatus = !statusFilter || inv.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      inv.noInvoice?.toLowerCase().includes(term) ||
      inv.namaPelanggan?.toLowerCase().includes(term) ||
      inv.alamatPelanggan?.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const totalTagihanAll = invoices
    .filter((i) => i.status !== "DIBATALKAN")
    .reduce((sum, i) => sum + (Number(i.totalBersih || i.totalTagihan) || 0), 0);

  const totalLunas = invoices
    .filter((i) => i.status === "LUNAS")
    .reduce((sum, i) => sum + (Number(i.totalBersih || i.totalTagihan) || 0), 0);

  const totalBelumBayar = invoices
    .filter((i) => i.status === "BELUM_DIBAYAR" || i.status === "BELUM_LUNAS")
    .reduce((sum, i) => sum + (Number(i.totalBersih || i.totalTagihan) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="text-blue-600" />
            Manajemen Faktur & Invoice Tagihan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gabungkan beberapa Surat Jalan (DO Terkirim) menjadi 1 Faktur Tagihan resmi lengkap dengan Kop Surat & Rekening Bank.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Muat Ulang
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
          >
            <Plus size={16} />
            + Buat Invoice Baru ({deliveredOrders.length} DO Siap)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold mb-1">
            <FileText size={13} />
            Total Nilai Faktur Diterbitkan
          </div>
          <p className="text-xl font-extrabold text-slate-900">{formatRupiah(totalTagihanAll)}</p>
          <p className="text-xs text-slate-500 mt-1">
            {invoices.filter((i) => i.status !== "DIBATALKAN").length} invoice aktif
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-emerald-700 uppercase font-semibold mb-1">
            <CheckCircle2 size={13} />
            Sudah Lunas Diterima
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{formatRupiah(totalLunas)}</p>
          <p className="text-xs text-slate-500 mt-1">
            {invoices.filter((i) => i.status === "LUNAS").length} invoice lunas
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-amber-700 uppercase font-semibold mb-1">
            <Clock size={13} />
            Belum Dibayar (Piutang)
          </div>
          <p className="text-xl font-extrabold text-amber-700">{formatRupiah(totalBelumBayar)}</p>
          <p className="text-xs text-slate-500 mt-1">
            {invoices.filter((i) => i.status === "BELUM_DIBAYAR" || i.status === "BELUM_LUNAS").length} invoice menunggu pelunasan
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Faktur atau Nama Pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
        >
          <option value="">Semua Status Pembayaran</option>
          <option value="BELUM_LUNAS">Belum Dibayar</option>
          <option value="LUNAS">Lunas</option>
          <option value="DIBATALKAN">Dibatalkan</option>
        </select>
      </div>

      {/* Invoice Table List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Memuat data invoice...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt size={38} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {searchTerm || statusFilter
                ? "Tidak ada invoice yang sesuai kriteria pencarian."
                : "Belum ada invoice yang dibuat."}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Klik &quot;Buat Invoice Baru&quot; untuk memilih DO Terkirim dan menggabungkannya ke Faktur.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-3">No. Invoice</th>
                  <th className="px-4 py-3">Pelanggan / Perusahaan</th>
                  <th className="px-4 py-3 text-center">DO Digabung</th>
                  <th className="px-4 py-3 text-right">Tagihan Bersih</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Tgl. Dibuat</th>
                  <th className="px-4 py-3 text-center">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((invoice) => {
                  const itemsCount =
                    (invoice.items && invoice.items.length) ||
                    (invoice.deliveryOrders && invoice.deliveryOrders.length) ||
                    0;
                  const total =
                    invoice.totalBersih || invoice.totalTagihan || 0;

                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {invoice.noInvoice}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{invoice.namaPelanggan}</p>
                        {invoice.alamatPelanggan && (
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">
                            {invoice.alamatPelanggan}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                          {itemsCount} Surat Jalan
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-emerald-700">
                        {formatRupiah(total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadgeInvoice status={invoice.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatTanggalWaktu(invoice.createdAt || invoice.tanggalInvoice)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(invoice)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition border border-blue-200"
                          >
                            <Eye size={13} />
                            Faktur Resmi (Kop)
                          </button>
                          {(invoice.status === "BELUM_DIBAYAR" ||
                            invoice.status === "BELUM_LUNAS") && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(invoice, "LUNAS")}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition"
                              >
                                <CheckCircle2 size={13} />
                                Lunas
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(invoice, "DIBATALKAN")}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 transition"
                              >
                                <XCircle size={13} />
                                Batal
                              </button>
                            </>
                          )}
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

      {/* Modal Buat Invoice (Multi-select DO) */}
      {showCreate && (
        <Modal
          title="Buat Invoice Baru (Gabungkan Pengiriman Terkirim)"
          onClose={() => setShowCreate(false)}
          maxWidth="max-w-2xl"
        >
          <CreateInvoiceModal
            deliveredOrders={deliveredOrders}
            onSubmit={handleGenerate}
            onClose={() => setShowCreate(false)}
          />
        </Modal>
      )}

      {/* Modal Detail & Cetak Invoice Resmi (Kop Surat & Multi-Table) */}
      {selectedInvoice && (
        <Modal
          title={`Faktur Tagihan Resmi: ${selectedInvoice.noInvoice}`}
          onClose={() => setSelectedInvoice(null)}
          maxWidth="max-w-5xl"
        >
          <InvoiceOfficialView
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        </Modal>
      )}
    </div>
  );
}
