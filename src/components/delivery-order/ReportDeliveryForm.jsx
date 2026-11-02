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

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("File bukti harus berupa gambar.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Ukuran foto maksimal 15 MB.");
      return;
    }

    let imageBitmap;
    let imageUrl;
    try {
      imageBitmap = await createImageBitmap(file);
      const maxDimension = 1600;
      const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(imageBitmap.width * scale));
      canvas.height = Math.max(1, Math.round(imageBitmap.height * scale));
      canvas.getContext("2d").drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
      const compressedImage = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error("Foto gagal diproses.")),
          "image/jpeg",
          0.8
        );
      });
      const reader = new FileReader();
      imageUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Foto gagal dibaca."));
        reader.readAsDataURL(compressedImage);
      });
      setBuktiPengirimanUrl(imageUrl);
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : "Foto gagal diproses.");
    } finally {
      imageBitmap?.close();
    }
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
        Melaporkan pengiriman <b>{order.noSchedule || "-"}</b> ke {order.tujuanKirim}
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
