"use client";

import { useMemo, useState } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { useTarif } from "../../hooks/useTarif";
import { formatRupiah } from "../../utils/format";

const JENIS_KENDARAAN = [
  "CDD 4 Ton",
  "CDD 8 Ton (Panjang 6 M)",
  "Fuso / CDD Besar",
  "Tronton",
];

export function DeliveryOrderForm({
  onSubmit,
  submitting,
}) {
  const { tarifList, loading: loadingTarif } = useTarif();
  const [form, setForm] = useState({
    namaSupir: "",
    noHpSupir: "",
    noPolisiKendaraan: "",
    jenisKendaraan: JENIS_KENDARAAN[1],
    tarifId: "",
    alamatLengkapTujuan: "",
    namaPenerima: "",
    noHpPenerima: "",
    namaBarang: "",
    jumlahKoli: 1,
    beratBarangKg: 0,
    catatanBarang: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const tarifTerpilih = useMemo(
    () => tarifList.find((t) => t.id === form.tarifId),
    [tarifList, form.tarifId]
  );

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await onSubmit(form);
      setSuccess(true);
      setForm({
        namaSupir: "",
        noHpSupir: "",
        noPolisiKendaraan: "",
        jenisKendaraan: JENIS_KENDARAAN[1],
        tarifId: "",
        alamatLengkapTujuan: "",
        namaPenerima: "",
        noHpPenerima: "",
        namaBarang: "",
        jumlahKoli: 1,
        beratBarangKg: 0,
        catatanBarang: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert type="error">{error}</Alert>}
      {success && (
        <Alert type="success">
          Data pengiriman berhasil disimpan dan dikirim untuk ACC Direktur.
        </Alert>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Data Supir & Kendaraan
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nama Supir"
            required
            value={form.namaSupir}
            onChange={(e) => update("namaSupir", e.target.value)}
          />
          <Input
            label="No. HP Supir"
            required
            value={form.noHpSupir}
            onChange={(e) => update("noHpSupir", e.target.value)}
          />
          <Input
            label="No. Polisi Kendaraan"
            required
            placeholder="cth: B 9123 ABC"
            value={form.noPolisiKendaraan}
            onChange={(e) => update("noPolisiKendaraan", e.target.value)}
          />
          <Select
            label="Jenis Kendaraan"
            value={form.jenisKendaraan}
            onChange={(e) => update("jenisKendaraan", e.target.value)}
          >
            {JENIS_KENDARAAN.map((jk) => (
              <option key={jk} value={jk}>
                {jk}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Tujuan Pengiriman
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Tujuan Kirim"
            required
            disabled={loadingTarif}
            value={form.tarifId}
            onChange={(e) => update("tarifId", e.target.value)}
          >
            <option value="">-- Pilih tujuan kirim --</option>
            {tarifList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.areaDistribusi} - {t.tujuanKirim}
              </option>
            ))}
          </Select>
          <Input
            label="Nama Penerima"
            required
            value={form.namaPenerima}
            onChange={(e) => update("namaPenerima", e.target.value)}
          />
          <Input
            label="No. HP Penerima"
            required
            value={form.noHpPenerima}
            onChange={(e) => update("noHpPenerima", e.target.value)}
          />
          <Input
            label="Alamat Lengkap Tujuan"
            required
            value={form.alamatLengkapTujuan}
            onChange={(e) => update("alamatLengkapTujuan", e.target.value)}
          />
        </div>

        {tarifTerpilih && (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            Biaya ekspedisi: <b>{formatRupiah(tarifTerpilih.total)}</b> &middot;
            {" "}Setelah PPh 2%:{" "}
            <b>{formatRupiah(tarifTerpilih.totalSetelahPPh)}</b>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Data Barang
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Nama Barang"
            required
            value={form.namaBarang}
            onChange={(e) => update("namaBarang", e.target.value)}
          />
          <Input
            label="Jumlah Koli"
            type="number"
            min={1}
            required
            value={form.jumlahKoli}
            onChange={(e) => update("jumlahKoli", Number(e.target.value))}
          />
          <Input
            label="Berat Barang (kg)"
            type="number"
            min={0}
            required
            value={form.beratBarangKg}
            onChange={(e) => update("beratBarangKg", Number(e.target.value))}
          />
        </div>
        <div className="mt-4">
          <Input
            label="Catatan Barang (opsional)"
            value={form.catatanBarang}
            onChange={(e) => update("catatanBarang", e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Menyimpan..." : "Simpan & Ajukan ACC"}
      </Button>
    </form>
  );
}
