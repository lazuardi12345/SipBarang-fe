"use client";

import { FormEvent, useState } from "react";
import { DeliveryOrder } from "./../../domain/entities/DeliveryOrder";
import { Input } from "./../../presentation/components/ui/Input";
import { Button } from "./../../presentation/components/ui/Button";
import { Alert } from "./../../presentation/components/ui/Alert";
import { formatRupiah, formatTanggal } from "./../../lib/format";
import { CreateInvoiceInput } from "./../../domain/entities/Invoice";

export function InvoiceForm({ deliveredOrders, onSubmit }) {
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
    setSubmitting(true);
    try {
      await onSubmit({
        namaPelanggan,
        alamatPelanggan,
        deliveryOrderIds: selected,
      });
      setNamaPelanggan("");
      setAlamatPelanggan("");
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nama Pelanggan"
          required
          value={namaPelanggan}
          onChange={(e) => setNamaPelanggan(e.target.value)}
        />
        <Input
          label="Alamat Pelanggan (opsional)"
          value={alamatPelanggan}
          onChange={(e) => setAlamatPelanggan(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          Pilih Data Pengiriman (status Terkirim)
        </p>
        {deliveredOrders.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada pengiriman berstatus Terkirim.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
            {deliveredOrders.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 hover:bg-slate-50"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(o.id)}
                    onChange={() => toggle(o.id)}
                  />
                  <span>
                    <span className="font-medium">{o.noDO}</span>{" "}
                    <span className="text-slate-400">
                      &middot; {o.tujuanKirim} &middot; {formatTanggal(o.tanggalKirim)}
                    </span>
                  </span>
                </span>
                <span className="text-slate-600">
                  {formatRupiah(o.totalSetelahPPh)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" disabled={submitting || selected.length === 0}>
        {submitting ? "Membuat invoice..." : "Buat Invoice"}
      </Button>
    </form>
  );
}
