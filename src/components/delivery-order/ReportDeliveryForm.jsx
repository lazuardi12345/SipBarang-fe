"use client";

import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";

export function ReportDeliveryForm({
  order,
  onSubmit,
  onClose,
}) {
  const [namaPenerimaBarang, setNamaPenerimaBarang] = useState(
    order.namaPenerima ?? order.namaToko ?? ""
  );
  const [catatanPelaporan, setCatatanPelaporan] = useState("");
  const [buktiPengirimanUrl, setBuktiPengirimanUrl] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBuktiPengirimanUrl(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        orderId: order.id,
        namaPenerimaBarang,
        catatanPelaporan,
        buktiPengirimanUrl,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melaporkan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}
      <p className="text-sm text-slate-600">
        Melaporkan pengiriman <b>{order.noDO}</b> ke {order.tujuanKirim}
      </p>
      <Input
        label="Nama Penerima yang Menerima Barang"
        required
        value={namaPenerimaBarang}
        onChange={(e) => setNamaPenerimaBarang(e.target.value)}
      />
      <Input
        label="Catatan (opsional)"
        value={catatanPelaporan}
        onChange={(e) => setCatatanPelaporan(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">
          Foto Bukti Terima (opsional)
        </label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {buktiPengirimanUrl && (
          <img
            src={buktiPengirimanUrl}
            alt="Bukti terima"
            className="mt-2 h-32 w-32 rounded-lg object-cover"
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Menyimpan..." : "Tandai Terkirim"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Batal
        </Button>
      </div>
    </form>
  );
}
