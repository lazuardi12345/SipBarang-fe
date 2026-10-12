import { useState, useMemo } from "react";
import { useDeliveryOrders } from "../hooks/useDeliveryOrders";
import { formatRupiah, formatTanggal } from "../utils/format";
import { RekapSuratJalanPrintView } from "../components/rekap/RekapSuratJalanPrintView";

// Definisi lokal untuk menghindari masalah Vite module cache
function formatTanggalSingkat(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return String(iso);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

import {
  FileText,
  Calendar,
  Printer,
  Download,
  Filter,
  RefreshCw,
  Building2,
  CheckCircle2,
  Search,
  Eye,
  Layers,
  ChevronRight
} from "lucide-react";

const COMPANY_PRESETS = {
  AYT: {
    nama: "PT ALMIRA YUNIAR TREK",
    singkatan: "AYT",
    alamat:
      "Jl. Kosambi Raya No. 45, Klari, Karawang Timur, Jawa Barat 41371",
    telepon: "081289123456",
    email: "almirayuniartrek@gmail.com",
  },
};

const CUSTOMER_PRESETS = {
  CIPTAPAPAN: {
    nama: "PT. CIPTAPAPAN DINAMIKA",
    alamat: "Graha GRC Board Lt. 3, Jl. S. Parman kav. 64, Jakarta 11410",
  },
  GRC: {
    nama: "PT. GRC BOARD INDONESIA",
    alamat: "Kawasan Industri KIIC, Jl. Maligi Raya Lot Q-2A, Karawang Barat",
  },
  BANGUN_PERKASA: {
    nama: "PT. BANGUN PERKASA JAYA",
    alamat: "Jl. Raya Subang - Cikampek Km. 12",
  },
};

export default function RekapSuratJalanPage() {
  const { orders, loading, refresh } = useDeliveryOrders();

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerPreset, setCustomerPreset] = useState("CIPTAPAPAN");
  const [customCustomerNama, setCustomCustomerNama] = useState("");
  const [customCustomerAlamat, setCustomCustomerAlamat] = useState("");
  const [companyPreset, setCompanyPreset] = useState("AYT");
  const [statusFilter, setStatusFilter] = useState("TERKIRIM");
  const [searchQuery, setSearchQuery] = useState("");

  // Mode View: "table" atau "print-preview"
  const [activeTab, setActiveTab] = useState("table");

  // Filter pengiriman sesuai kriteria
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Filter Status
      if (statusFilter && statusFilter !== "ALL") {
        if (o.status !== statusFilter) return false;
      }

      // 2. Filter Tanggal Mulai (startDate)
      const orderDateStr = o.tanggalKirim || o.createdAt;
      if (startDate && orderDateStr) {
        const orderDate = new Date(orderDateStr).setHours(0, 0, 0, 0);
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }

      // 3. Filter Tanggal Selesai (endDate)
      if (endDate && orderDateStr) {
        const orderDate = new Date(orderDateStr).setHours(23, 59, 59, 999);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mSchedule = o.noSchedule?.toLowerCase().includes(q);
        const mDoc = o.noDocPerusahaan?.toLowerCase().includes(q);
        const mDO = o.noDO?.toLowerCase().includes(q);
        const mToko = (o.namaToko || o.namaPenerima || "").toLowerCase().includes(q);
        const mArea = (o.areaDistribusi || o.tujuanKirim || "").toLowerCase().includes(q);
        const mSupir = o.namaSupir?.toLowerCase().includes(q);
        if (!mSchedule && !mDoc && !mDO && !mToko && !mArea && !mSupir) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, startDate, endDate, searchQuery]);

  // Data Perusahaan & Customer
  const companyInfo = COMPANY_PRESETS[companyPreset] || COMPANY_PRESETS.AYT;
  const customerInfo = {
    nama: customCustomerNama || CUSTOMER_PRESETS[customerPreset]?.nama || "PT. CIPTAPAPAN DINAMIKA",
    alamat:
      customCustomerAlamat ||
      CUSTOMER_PRESETS[customerPreset]?.alamat ||
      "Graha GRC Board Lt. 3, Jl. S. Parman kav. 64, Jakarta 11410",
  };

  // Metrik Perhitungan
  const totalTarif = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + Number(o.biayaEkspedisi || 0), 0),
    [filteredOrders]
  );
  const totalPPh2 = useMemo(
    () =>
      filteredOrders.reduce(
        (sum, o) =>
          sum + Number(o.pph2Persen ?? Math.round(Number(o.biayaEkspedisi || 0) * 0.02)),
        0
      ),
    [filteredOrders]
  );
  const totalNetto = totalTarif - totalPPh2;

  // Helper ekstrak nama area tujuan bersih (contoh: "BOGOR - KARAWANG" -> "KARAWANG")
  const getCleanArea = (order) => {
    const raw = order.tujuanKirim || order.areaDistribusi || "-";
    const str = String(raw).trim();
    if (str.includes("-")) {
      const parts = str.split("-");
      const last = parts[parts.length - 1].trim();
      if (last) return last.toUpperCase();
    }
    if (str.includes("->")) {
      const parts = str.split("->");
      const last = parts[parts.length - 1].trim();
      if (last) return last.toUpperCase();
    }
    return str.toUpperCase();
  };

  // Susun data tabel dengan kolom Area di-merge (rowspan) jika tujuan/area sama
  const tableRowsWithAreaMerge = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];

    // Kelompokkan data yang memiliki area tujuan yang sama agar bersebelahan
    const areaMap = new Map();
    filteredOrders.forEach((order) => {
      const cleanArea = getCleanArea(order);
      if (!areaMap.has(cleanArea)) {
        areaMap.set(cleanArea, []);
      }
      areaMap.get(cleanArea).push(order);
    });

    const rows = [];
    let counter = 1;

    areaMap.forEach((ordersInArea, cleanArea) => {
      const span = ordersInArea.length;
      ordersInArea.forEach((order, index) => {
        rows.push({
          rowNo: counter++,
          order,
          isFirstInArea: index === 0,
          areaSpan: span,
          areaText: cleanArea,
        });
      });
    });

    return rows;
  }, [filteredOrders]);

  // Shortcut Filter Tanggal
  const setRangeToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setRangeThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const setRangeClear = () => {
    setStartDate("");
    setEndDate("");
  };

  // Periode Text
  const periodeText = useMemo(() => {
    if (startDate && endDate) {
      return `${formatTanggalSingkat(startDate)} s/d ${formatTanggalSingkat(endDate)}`;
    }
    if (startDate) return `Mulai ${formatTanggalSingkat(startDate)}`;
    if (endDate) return `Sampai ${formatTanggalSingkat(endDate)}`;
    return "Semua Periode";
  }, [startDate, endDate]);

  // Export CSV sederhana
  const exportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = [
      "No",
      "Nomor Schedule",
      "Nomor Doc Perusahaan",
      "No DO",
      "Rit",
      "Tanggal",
      "Area Distribusi",
      "Toko/Penerima",
      "Tarif Bruto",
      "PPh 2%",
      "Total - PPh 2%",
    ];
    const rows = filteredOrders.map((o, idx) => {
      const tarif = Number(o.biayaEkspedisi || 0);
      const pph = Number(o.pph2Persen ?? Math.round(tarif * 0.02));
      const netto = tarif - pph;
      return [
        idx + 1,
        `"${o.noSchedule || "-"}"`,
        `"${o.noDocPerusahaan || "-"}"`,
        `"${o.noDO || "-"}"`,
        `"${o.tipeMobilRit || "1"}"`,
        `"${formatTanggalSingkat(o.tanggalKirim)}"`,
        `"${o.areaDistribusi || o.tujuanKirim || "-"}"`,
        `"${(o.namaToko || o.namaPenerima || "-").replace(/"/g, '""')}"`,
        tarif,
        pph,
        netto,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rekap_Surat_Jalan_${startDate || "all"}_sd_${endDate || "all"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── HEADER HALAMAN ── */}
      <div className="no-print flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 uppercase tracking-wider">
              Laporan & Rekapitulasi
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-500">PPh 2% Per Pengiriman</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
            Rekap Surat Jalan
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Cetak rekap tagihan surat jalan resmi per periode tanggal untuk pabrik (Format standar PHT / AYT).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            disabled={filteredOrders.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("print-preview");
              setTimeout(() => window.print(), 300);
            }}
            disabled={filteredOrders.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition disabled:opacity-50"
          >
            <Printer size={15} />
            <span>Cetak Rekap A4</span>
          </button>
        </div>
      </div>

      {/* ── CARD FILTER TANGGAL & PELANGGAN ── */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Filter size={15} className="text-blue-600" />
            <span>Filter Rekapitulasi</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400">Pilihan cepat tanggal:</span>
            <button
              type="button"
              onClick={setRangeToday}
              className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 hover:bg-slate-200"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={setRangeThisMonth}
              className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 hover:bg-slate-200"
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={setRangeClear}
              className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-500 hover:bg-slate-200"
            >
              Semua
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tanggal Dari */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dari Tanggal (Start Date)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Tanggal Sampai */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sampai Tanggal (End Date)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Pelanggan Yang Ditagih */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pabrik / Pelanggan (Untuk)
            </label>
            <select
              value={customerPreset}
              onChange={(e) => {
                setCustomerPreset(e.target.value);
                setCustomCustomerNama("");
                setCustomCustomerAlamat("");
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="CIPTAPAPAN">PT. CIPTAPAPAN DINAMIKA (Graha GRC)</option>
              <option value="GRC">PT. GRC BOARD INDONESIA (KIIC)</option>
              <option value="BANGUN_PERKASA">PT. BANGUN PERKASA JAYA</option>
            </select>
          </div>

          {/* Kop Surat Perusahaan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kop Surat Ekspedisi
            </label>
            <div className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50">
              PT ALMIRA YUNIAR TREK (AYT)
            </div>
          </div>
        </div>

        {/* Baris Kedua: Pencarian & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nomor Schedule, No. Doc Pabrik, No. DO, Area, Toko, Supir..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="TERKIRIM">Status: Terkirim (ACC Selesai)</option>
              <option value="ALL">Status: Semua (Draft, Jalan & Terkirim)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── RINGKASAN METRIK REKAP ── */}
      <div className="no-print grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Jumlah Dokumen (Doc)
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">
            {filteredOrders.length} <span className="text-xs font-semibold text-slate-500">Surat Jalan</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Total Tarif Bruto
          </p>
          <p className="mt-1 text-lg font-extrabold text-slate-900 font-mono">
            {formatRupiah(totalTarif)}
          </p>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50/50 p-3.5 shadow-sm">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
            Potongan PPh 2%
          </p>
          <p className="mt-1 text-lg font-extrabold text-red-700 font-mono">
            - {formatRupiah(totalPPh2)}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
            Total Tagihan Netto (Total - PPh)
          </p>
          <p className="mt-1 text-lg font-black text-emerald-800 font-mono">
            {formatRupiah(totalNetto)}
          </p>
        </div>
      </div>

      {/* ── TAB NAVIGASI TAMPILAN: TABEL VS PRATINJAU CETAK ── */}
      <div className="no-print flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("table")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "table"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers size={14} />
          <span>Daftar Tabel ({filteredOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("print-preview")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "print-preview"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Eye size={14} />
          <span>Pratinjau Dokumen Fisik (Format Foto)</span>
        </button>
      </div>

      {/* ── TAMPILAN 1: TABEL INTERAKTIF WEB ── */}
      {activeTab === "table" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-center w-8">No</th>
                  <th className="px-3 py-3">No Schedule</th>
                  <th className="px-3 py-3">No Doc Pabrik</th>
                  <th className="px-3 py-3">Tanggal</th>
                  <th className="px-3 py-3 text-center">Rit</th>
                  <th className="px-3 py-3">Area</th>
                  <th className="px-3 py-3 text-right">Tarif (Bruto)</th>
                  <th className="px-3 py-3 text-right">Total - PPh 2%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRowsWithAreaMerge.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <FileText size={36} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-sm">Tidak ada data surat jalan</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Sesuaikan filter tanggal atau status di atas untuk melihat rekap.
                      </p>
                    </td>
                  </tr>
                ) : (
                  tableRowsWithAreaMerge.map((item) => {
                    const order = item.order;
                    const tarif = Number(order.biayaEkspedisi || 0);
                    const pph2 = Number(order.pph2Persen ?? Math.round(tarif * 0.02));
                    const netto = tarif - pph2;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition text-slate-700">
                        {/* No */}
                        <td className="px-3 py-2.5 text-center font-semibold text-slate-400">
                          {item.rowNo}
                        </td>
                        {/* No Schedule */}
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-800">
                          {order.noSchedule || "-"}
                        </td>
                        {/* No Doc Pabrik */}
                        <td className="px-3 py-2.5 font-mono text-blue-900 font-semibold">
                          {order.noDocPerusahaan || order.noDO || "-"}
                        </td>
                        {/* Tanggal */}
                        <td className="px-3 py-2.5 font-mono text-slate-600">
                          {formatTanggalSingkat(order.tanggalKirim)}
                        </td>
                        {/* Rit */}
                        <td className="px-3 py-2.5 text-center">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-700">
                            {order.tipeMobilRit || "1"}
                          </span>
                        </td>
                        {/* Area (Di-merge jika tujuannya sama) */}
                        {item.isFirstInArea && (
                          <td
                            rowSpan={item.areaSpan}
                            className={`px-3 py-2.5 font-bold text-slate-900 align-middle ${
                              item.areaSpan > 1 ? "bg-slate-50/70 border-y border-slate-200" : ""
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{item.areaText}</span>
                              {item.areaSpan > 1 && (
                                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                                  {item.areaSpan} DO
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        {/* Tarif Bruto */}
                        <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900">
                          {formatRupiah(tarif)}
                        </td>
                        {/* Total - PPh 2% */}
                        <td className="px-3 py-2.5 text-right font-mono font-extrabold text-emerald-700">
                          {formatRupiah(netto)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {filteredOrders.length > 0 && (
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right uppercase text-slate-700 text-xs">
                      Grand Total ({filteredOrders.length} Pengiriman):
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-900">
                      {formatRupiah(totalTarif)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-emerald-800 text-sm font-black">
                      {formatRupiah(totalNetto)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}


      {/* ── TAMPILAN 2: PRATINJAU DOKUMEN FISIK FORMAT FOTO ── */}
      {activeTab === "print-preview" && (
        <RekapSuratJalanPrintView
          orders={filteredOrders}
          companyInfo={companyInfo}
          customerInfo={customerInfo}
          periodeText={periodeText}
          onClose={() => setActiveTab("table")}
        />
      )}
    </div>
  );
}
