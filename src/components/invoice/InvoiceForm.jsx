import { useState } from "react";
import { formatTanggal } from "../../utils/format";

/**
 * InvoiceForm — Komponen pemilihan DO untuk invoice.
 * Semua logik generate invoice ada di Backend (GenerateInvoiceUseCase.js di BE).
 * FE hanya mengirim: { namaPelanggan, alamatPelanggan, noPoCustomer, deliveryOrderIds }
 * ke endpoint POST /api/invoices via useInvoices().generate()
 */
export function InvoiceForm({ deliveredOrders = [], onSubmit, onClose }) {
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [alamatPelanggan, setAlamatPelanggan] = useState("");
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (selected.length === 0) {
      setError("Pilih minimal satu pengiriman untuk digabungkan ke invoice");
      return;
    }
    if (!namaPelanggan.trim()) {
      setError("Nama Pelanggan wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      // Kirim ke BE via ApiInvoiceRepository.create → POST /api/invoices
      await onSubmit({
        namaPelanggan,
        alamatPelanggan,
        deliveryOrderIds: selected,
      });
      setNamaPelanggan("");
      setAlamatPelanggan("");
      setSelected([]);
      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}

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
            Alamat Pelanggan (Opsional)
          </label>
          <input
            value={alamatPelanggan}
            onChange={(e) => setAlamatPelanggan(e.target.value)}
            placeholder="Kawasan Industri KIIC, Karawang..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-slate-700 uppercase">
          Pilih Pengiriman (Status Terkirim) *
        </p>
        {deliveredOrders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            Belum ada pengiriman berstatus Terkirim yang siap ditagihkan.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
            {deliveredOrders.map((o) => (
              <label
                key={o.id}
                className={`flex cursor-pointer items-center justify-between gap-3 p-3 text-xs select-none transition ${
                  selected.includes(o.id) ? "bg-blue-50/70" : "hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 accent-blue-600 h-4 w-4 shrink-0"
                    checked={selected.includes(o.id)}
                    onChange={() => toggle(o.id)}
                  />
                  <span className="min-w-0">
                    <span className="font-mono font-bold text-slate-900">{o.noDO}</span>{" "}
                    <span className="text-slate-500">
                      · {o.namaToko || o.namaPenerima || o.tujuanKirim} · {formatTanggal(o.tanggalKirim)}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
        {selected.length > 0 && (
          <p className="mt-1.5 text-[11px] text-blue-700 font-semibold">
            ✓ {selected.length} pengiriman dipilih
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || selected.length === 0 || !namaPelanggan.trim()}
          className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {submitting ? "Menerbitkan..." : `Buat Invoice (${selected.length} DO)`}
        </button>
      </div>
    </form>
  );
}
