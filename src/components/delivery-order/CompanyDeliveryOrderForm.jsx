"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Truck, FileText, MapPin, Package, CheckCircle2 } from "lucide-react";
import { useTarif } from "../../hooks/useTarif";
import { formatRupiah } from "../../utils/format";

export function CompanyDeliveryOrderForm({ onSubmit, submitting }) {
  const { tarifList, loading: loadingTarif } = useTarif();

  // Header Schedule
  const [noSchedule, setNoSchedule] = useState(`S0794312/IX/${new Date().getFullYear()}`);
  const [tglSchedule, setTglSchedule] = useState(new Date().toISOString().split("T")[0]);
  const [tipeMobilRit, setTipeMobilRit] = useState("8 TON / Rit : 1");
  const [gudangAsal, setGudangAsal] = useState("GUDANG PUSAT - KARAWANG");
  const [noPolisiKendaraan, setNoPolisiKendaraan] = useState("");
  const [namaSupir, setNamaSupir] = useState("");
  const [noHpSupir, setNoHpSupir] = useState("");

  // Dokumen Perusahaan (Surat Jalan Pabrik)
  const [noDocPerusahaan, setNoDocPerusahaan] = useState("");
  const [tglDocPerusahaan, setTglDocPerusahaan] = useState(new Date().toISOString().split("T")[0]);
  const [namaToko, setNamaToko] = useState("");
  const [agen, setAgen] = useState("TBN");
  const [salesman, setSalesman] = useState("");
  const [kota, setKota] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [alamatLengkapTujuan, setAlamatLengkapTujuan] = useState("");
  const [noHpPenerima, setNoHpPenerima] = useState("");
  const [keteranganDoc, setKeteranganDoc] = useState("");

  // Tarif & Lokasi
  const [tarifId, setTarifId] = useState("");

  // Daftar Produk Muatan (dengan Qty dan Harga Satuan)
  const [itemsBarang, setItemsBarang] = useState([
    { namaBarang: "GRC board 4 mm 1220 x 2440 SE", jumlah: 110, satuan: "Lembar", hargaSatuan: 65000 },
  ]);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitMode, setSubmitMode] = useState("DRAFT"); // 'DRAFT' | 'MENUNGGU_ACC'

  const tarifTerpilih = useMemo(
    () => tarifList.find((t) => t.id === tarifId),
    [tarifList, tarifId]
  );

  const totalNilaiMuatan = useMemo(() => {
    return itemsBarang.reduce(
      (sum, i) => sum + (Number(i.jumlah) || 0) * (Number(i.hargaSatuan) || 0),
      0
    );
  }, [itemsBarang]);

  const totalKoliMuatan = useMemo(() => {
    return itemsBarang.reduce((sum, i) => sum + (Number(i.jumlah) || 0), 0);
  }, [itemsBarang]);

  const addItem = () => {
    setItemsBarang((prev) => [
      ...prev,
      { namaBarang: "", jumlah: 1, satuan: "Pcs", hargaSatuan: 0 },
    ]);
  };

  const removeItem = (index) => {
    setItemsBarang((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItemsBarang((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleTarifChange = (e) => {
    const selectedId = e.target.value;
    setTarifId(selectedId);
    const selected = tarifList.find((t) => t.id === selectedId);
    if (selected) {
      if (!kota) setKota(selected.tujuanKirim);
    }
  };

  const handleSubmit = async (mode = "DRAFT") => {
    setError(null);
    setSuccessMessage(null);

    if (!namaSupir || !noPolisiKendaraan) {
      setError("Nama supir dan no polisi armada wajib diisi");
      return;
    }

    if (!tarifId) {
      setError("Pilih tujuan kirim & tarif ekspedisi");
      return;
    }

    if (!namaToko) {
      setError("Nama Toko / Depo tujuan wajib diisi");
      return;
    }

    if (itemsBarang.length === 0 || !itemsBarang[0].namaBarang) {
      setError("Minimal tambahkan 1 produk / muatan barang");
      return;
    }

    if (mode === "MENUNGGU_ACC" && !noDocPerusahaan) {
      setError("Nomor Dokumen / Surat Jalan dari Perusahaan wajib diisi jika langsung diajukan ke Direktur");
      return;
    }

    try {
      await onSubmit({
        noSchedule,
        tglSchedule,
        tipeMobilRit,
        gudangAsal,
        namaSupir,
        noHpSupir,
        noPolisiKendaraan,
        jenisKendaraan: "Mobil CDD 8 Ton (Panjang 6 M)",

        noDocPerusahaan,
        tglDocPerusahaan,
        namaToko,
        namaPenerima: namaToko,
        agen,
        salesman,
        kota,
        kecamatan,
        alamatLengkapTujuan,
        noHpPenerima,
        keteranganDoc,

        tarifId,
        itemsBarang,
        namaBarang: itemsBarang
          .map(
            (i) =>
              `${i.namaBarang} (${i.jumlah} ${i.satuan || "pcs"}${
                i.hargaSatuan ? ` @ ${formatRupiah(i.hargaSatuan)}` : ""
              })`
          )
          .join(", "),
        jumlahKoli: totalKoliMuatan,
        totalNilaiBarang: totalNilaiMuatan,
        status: mode,
      });

      if (mode === "DRAFT") {
        setSuccessMessage("Pengiriman berhasil disimpan sebagai DRAFT list! Anda bisa mengajukannya ke Direktur nanti setelah surat jalan turun.");
      } else {
        setSuccessMessage("Surat Jalan Pengiriman berhasil disimpan dan diajukan ke Direktur untuk di-ACC!");
      }

      // Reset form doc fields so admin can input another order quickly
      setNoDocPerusahaan("");
      setNamaToko("");
      setAlamatLengkapTujuan("");
      setKeteranganDoc("");
      setItemsBarang([{ namaBarang: "", jumlah: 1, satuan: "Pcs", hargaSatuan: 0 }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengiriman");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Bagian 1: Header Schedule & Armada */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-brand-dark font-semibold text-base border-b pb-3">
          <Truck size={20} className="text-blue-600" />
          <span>1. Data Jadwal (Schedule) & Armada Ekspedisi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gudang Asal</label>
            <input
              type="text"
              value={gudangAsal}
              onChange={(e) => setGudangAsal(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">No. Schedule Pabrik</label>
            <input
              type="text"
              placeholder="Contoh: S0794312/IX/2026"
              value={noSchedule}
              onChange={(e) => setNoSchedule(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tgl. Schedule</label>
            <input
              type="date"
              value={tglSchedule}
              onChange={(e) => setTglSchedule(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Mobil / Rit</label>
            <input
              type="text"
              placeholder="Contoh: 8 TON / Rit : 1"
              value={tipeMobilRit}
              onChange={(e) => setTipeMobilRit(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">No. Polisi Armada *</label>
            <input
              type="text"
              placeholder="Contoh: B 9482 KDA"
              value={noPolisiKendaraan}
              onChange={(e) => setNoPolisiKendaraan(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold uppercase focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Supir *</label>
            <input
              type="text"
              placeholder="Nama Supir"
              value={namaSupir}
              onChange={(e) => setNamaSupir(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP Supir</label>
            <input
              type="text"
              placeholder="0812xxxx"
              value={noHpSupir}
              onChange={(e) => setNoHpSupir(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bagian 2: Surat Jalan Perusahaan (Doc Pabrik) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-brand-dark font-semibold text-base border-b pb-3">
          <FileText size={20} className="text-amber-600" />
          <span>2. Dokumen Surat Jalan dari Perusahaan (Pabrik)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">No. Doc Perusahaan</label>
            <input
              type="text"
              placeholder="Contoh: 26001073074"
              value={noDocPerusahaan}
              onChange={(e) => setNoDocPerusahaan(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tgl. Doc</label>
            <input
              type="date"
              value={tglDocPerusahaan}
              onChange={(e) => setTglDocPerusahaan(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Toko / Depo Tujuan *</label>
            <input
              type="text"
              placeholder="Contoh: T15507 - INDAH JAYA, TB"
              value={namaToko}
              onChange={(e) => setNamaToko(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Salesman</label>
            <input
              type="text"
              placeholder="Contoh: CAHYONO"
              value={salesman}
              onChange={(e) => setSalesman(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Agen</label>
            <input
              type="text"
              placeholder="Contoh: TBN"
              value={agen}
              onChange={(e) => setAgen(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
            <input
              type="text"
              placeholder="Contoh: SUBANG"
              value={kota}
              onChange={(e) => setKota(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kecamatan</label>
            <input
              type="text"
              placeholder="Contoh: BINONG"
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">No. Telp Toko/Penerima</label>
            <input
              type="text"
              placeholder="089627610204"
              value={noHpPenerima}
              onChange={(e) => setNoHpPenerima(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap Toko</label>
            <input
              type="text"
              placeholder="Jl. Sumoharjo Kp. Kranji 2 Rt/Rw. 002/006 Kel. Kediri Kec. Binong - Subang"
              value={alamatLengkapTujuan}
              onChange={(e) => setAlamatLengkapTujuan(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Orderan Merchant</label>
            <input
              type="text"
              placeholder="Contoh: Orderan Merchant : ORD/202608/9586 - Online *notes: jumat libur"
              value={keteranganDoc}
              onChange={(e) => setKeteranganDoc(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bagian 3: Tujuan Kirim & Tarif Ekspedisi PT ALMAIRA YUNIAR TREK */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-brand-dark font-semibold text-base border-b pb-3">
          <MapPin size={20} className="text-emerald-600" />
          <span>3. Tujuan Kirim & Tarif Ekspedisi (Berdasarkan Surat Kiriman Dari Karawang)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Rute Tujuan Kirim (Mobil CDD 8 Ton Panjang 6M) *
            </label>
            <select
              value={tarifId}
              onChange={handleTarifChange}
              required
              disabled={loadingTarif}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Tujuan Pengiriman ({tarifList.length} Rute Tersedia) --</option>
              {tarifList.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.areaDistribusi}] {t.tujuanKirim} - Tarif: {formatRupiah(t.total)}
                </option>
              ))}
            </select>
          </div>

          {tarifTerpilih && (
            <>
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <span className="text-xs text-blue-700 font-medium">Area Distribusi & Rute</span>
                <p className="mt-1 text-base font-bold text-blue-950">{tarifTerpilih.areaDistribusi}</p>
                <p className="text-xs text-blue-600 mt-0.5">{tarifTerpilih.tujuanKirim}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-600 font-medium">Tarif Ekspedisi Karawang</span>
                <p className="mt-1 text-base font-bold text-slate-900">{formatRupiah(tarifTerpilih.total)}</p>
                <p className="text-xs text-slate-500 mt-0.5">Mobil CDD 8 Ton Panjang 6M</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-600 font-medium">Alamat Tujuan Pengiriman</span>
                <p className="mt-1 text-sm font-semibold text-slate-800 truncate">
                  {alamatLengkapTujuan || `${kota || tarifTerpilih.tujuanKirim}, ${kecamatan || ""}` || "Sesuai alamat toko"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Toko: {namaToko || "-"}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bagian 4: Rincian Produk / Muatan Barang */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <div className="flex items-center gap-2 text-brand-dark font-semibold text-base">
            <Package size={20} className="text-purple-600" />
            <span>4. Rincian Produk / Muatan Barang</span>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
          >
            <Plus size={15} />
            Tambah Baris Produk
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-3 py-2.5 w-10">No</th>
                <th className="px-3 py-2.5">Nama Produk / Barang</th>
                <th className="px-3 py-2.5 w-24">Jumlah / Qty</th>
                <th className="px-3 py-2.5 w-28">Satuan</th>
                <th className="px-3 py-2.5 w-36">Harga Satuan (Rp)</th>
                <th className="px-3 py-2.5 w-36 text-right">Subtotal Harga</th>
                <th className="px-3 py-2.5 w-12 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemsBarang.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 text-slate-500">{index + 1}</td>
                  <td className="px-3 py-2.5">
                    <input
                      type="text"
                      placeholder="Contoh: GRC board 4 mm 1220 x 2440 SE"
                      value={item.namaBarang}
                      onChange={(e) => updateItem(index, "namaBarang", e.target.value)}
                      required
                      className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2.5 w-24">
                    <input
                      type="number"
                      min="1"
                      value={item.jumlah}
                      onChange={(e) => updateItem(index, "jumlah", Number(e.target.value) || 0)}
                      required
                      className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2.5 w-28">
                    <input
                      type="text"
                      placeholder="Lembar/Pcs"
                      value={item.satuan}
                      onChange={(e) => updateItem(index, "satuan", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2.5 w-36">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-semibold">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        value={item.hargaSatuan || ""}
                        onChange={(e) =>
                          updateItem(index, "hargaSatuan", Number(e.target.value) || 0)
                        }
                        className="w-full rounded-md border border-slate-300 pl-8 pr-2 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2.5 w-36 font-mono font-bold text-slate-900 text-xs text-right whitespace-nowrap">
                    {formatRupiah((Number(item.jumlah) || 0) * (Number(item.hargaSatuan) || 0))}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {itemsBarang.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer Total Muatan & Nilai Barang */}
            <tfoot className="border-t-2 border-slate-200 bg-slate-50/80 font-semibold text-xs">
              <tr>
                <td colSpan={2} className="px-3 py-2.5 text-slate-700 uppercase font-bold">
                  Total Muatan & Nilai Barang:
                </td>
                <td className="px-3 py-2.5 font-bold text-purple-800 whitespace-nowrap">
                  {totalKoliMuatan} Koli / Lembar
                </td>
                <td></td>
                <td className="px-3 py-2.5 text-right text-slate-500 uppercase text-[11px]">
                  Total Nilai:
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-800 text-sm whitespace-nowrap">
                  {formatRupiah(totalNilaiMuatan)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tombol Simpan Draft & Kirim ke Direktur */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t">
        <p className="text-xs text-slate-500">
          💡 <strong>Tips:</strong> Anda bisa input banyak pengiriman dulu sebagai <strong>Draft</strong>. Saat surat jalan dari pabrik turun, ajukan ke Direktur untuk di-ACC.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("DRAFT")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 transition shadow-xs"
          >
            <span>💾</span>
            {submitting ? "Menyimpan..." : "Simpan sebagai Draft"}
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("MENUNGGU_ACC")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Truck size={18} />
            {submitting ? "Memproses..." : "Simpan & Langsung Ajukan ke Direktur"}
          </button>
        </div>
      </div>
    </div>
  );
}
