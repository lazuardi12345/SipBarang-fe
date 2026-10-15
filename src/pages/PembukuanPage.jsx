import { useMemo, useState } from "react";
import { CalendarDays, Download, Printer, RefreshCw, Search } from "lucide-react";
import { useDeliveryOrders } from "../hooks/useDeliveryOrders";
import { useAuth } from "../context/AuthContext";
import { deliveryOrderApi } from "../api/deliveryOrders";
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_PHONE,
  UserRole,
} from "../utils/constants";
import { formatTanggal } from "../utils/format";

const ROWS_PER_PAGE = 15;

function getLocalDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function getRit(value) {
  const normalized = String(value || "").trim();
  const ritMatch =
    normalized.match(/\brit\b\s*(?:ke[- ]?)?(\d+)/i) ||
    normalized.match(/(\d+)\s*\brit\b/i);

  if (ritMatch) return ritMatch[1];
  return /^\d+$/.test(normalized) ? normalized : "";
}

function getOrderRit(order) {
  return getRit(order.rit || order.jumlahRit || order.tipeMobilRit);
}

function getOrderDate(order) {
  return order.tglSchedule || "";
}

function formatDate(value) {
  if (!value) return "";
  return formatTanggal(value);
}

function chunkRows(rows) {
  const source = rows.length > 0 ? rows : [];
  if (source.length === 0) return [[]];

  const pages = [];
  for (let index = 0; index < source.length; index += ROWS_PER_PAGE) {
    pages.push(source.slice(index, index + ROWS_PER_PAGE));
  }
  return pages;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

export default function PembukuanPage() {
  const { orders, loading, error, refresh } = useDeliveryOrders();
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("TERKIRIM");
  const [search, setSearch] = useState("");
  const [lembarDrafts, setLembarDrafts] = useState({});
  const [savingId, setSavingId] = useState("");
  const [saveError, setSaveError] = useState("");
  const [printDate, setPrintDate] = useState(getLocalDateInputValue);
  const canEditLembar = String(user?.role || "").toUpperCase() === UserRole.ADMIN;

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;

      const date = getOrderDate(order);
      const timestamp = date ? new Date(date).getTime() : null;
      if ((fromDate || toDate) && timestamp === null) return false;
      if (fromDate && timestamp !== null && timestamp < new Date(`${fromDate}T00:00:00`).getTime()) return false;
      if (toDate && timestamp !== null && timestamp > new Date(`${toDate}T23:59:59.999`).getTime()) return false;

      if (!query) return true;
      return [
        order.namaToko,
        order.namaPenerima,
        order.noSchedule,
        order.noDocPerusahaan,
        order.noDO,
        order.tujuanKirim,
        order.areaDistribusi,
      ].some((value) => String(value || "").toLocaleLowerCase("id-ID").includes(query));
    });
  }, [orders, statusFilter, fromDate, toDate, search]);

  const getLembarValue = (order) =>
    Object.prototype.hasOwnProperty.call(lembarDrafts, order.id)
      ? lembarDrafts[order.id]
      : order.lembar || "";

  const updateLembarDraft = (orderId, value) => {
    setLembarDrafts((current) => ({ ...current, [orderId]: value }));
  };

  const saveLembar = async (order) => {
    setSavingId(order.id);
    setSaveError("");
    try {
      await deliveryOrderApi.updateLembar(order.id, getLembarValue(order));
      setLembarDrafts((current) => {
        const next = { ...current };
        delete next[order.id];
        return next;
      });
      await refresh();
    } catch (saveError) {
      setSaveError(saveError instanceof Error ? saveError.message : "Gagal menyimpan kolom lembar.");
    } finally {
      setSavingId("");
    }
  };

  const exportCsv = () => {
    const headers = ["No", "Distributor", "Tgl MDO", "MDO", "No Surat Jalan", "Lembar", "Rit"];
    const records = filteredOrders.map((order, index) => [
      index + 1,
      order.namaToko || order.namaPenerima || "",
      formatDate(order.tglSchedule),
      order.noSchedule || "",
      order.noDocPerusahaan || order.noDO || "",
      getLembarValue(order),
      getOrderRit(order),
    ]);
    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...records].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const link = document.createElement("a");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    link.href = url;
    link.download = `Pembukuan_Surat_Jalan_${fromDate || "semua"}_${toDate || "tanggal"}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const printPembukuan = async () => {
    setSaveError("");
    const printWindow = window.open("", "_blank", "popup,width=1100,height=800");
    if (!printWindow) {
      setSaveError("Jendela cetak diblokir browser. Izinkan pop-up untuk aplikasi ini, lalu coba lagi.");
      return;
    }

    const pages = chunkRows(filteredOrders);
    const renderedPages = pages.map((pageRows, pageIndex) => {
      const bodyRows = Array.from({ length: ROWS_PER_PAGE }, (_, rowIndex) => {
        const order = pageRows[rowIndex];
        return `
          <tr>
            <td>${rowIndex + 1}</td>
            <td>${escapeHtml(order ? order.namaToko || order.namaPenerima || "" : "")}</td>
            <td>${escapeHtml(order ? formatDate(order.tglSchedule) : "")}</td>
            <td>${escapeHtml(order?.noSchedule || "")}</td>
            <td>${escapeHtml(order ? order.noDocPerusahaan || order.noDO || "" : "")}</td>
            <td>${escapeHtml(order ? getLembarValue(order) : "")}</td>
            <td>${escapeHtml(order ? getOrderRit(order) : "")}</td>
          </tr>`;
      }).join("");

      return `
        <section class="page${pageIndex === pages.length - 1 ? " last-page" : ""}">
          <header class="letterhead">
            <img src="${new URL("/assets/logo.jpg", window.location.href)}" alt="Logo PT Almira Yuniar Trek">
            <div class="company">
              <h1>${escapeHtml(COMPANY_NAME)}</h1>
              <p>${escapeHtml(COMPANY_ADDRESS)}</p>
              <p>No. Handphone: ${escapeHtml(COMPANY_PHONE)} | Email: ${escapeHtml(COMPANY_EMAIL)}</p>
            </div>
          </header>
          <h2 class="title">TANDA TERIMA SURAT JALAN</h2>
          <p class="date">Tanggal: ${escapeHtml(printDate ? formatDate(printDate) : "")}</p>
          <table>
            <colgroup>
              <col style="width:5%"><col style="width:23%"><col style="width:14%">
              <col style="width:15%"><col style="width:19%"><col style="width:12%"><col style="width:12%">
            </colgroup>
            <thead><tr>
              <th>No</th><th>Distributor</th><th>Tgl MDO</th><th>MDO</th>
              <th>No Surat Jalan</th><th>Lembar</th><th>Rit</th>
            </tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
          <footer class="signatures">
            <div><span>Diserahkan Oleh,</span><span class="signature-space"></span><strong>________________________</strong></div>
            <div><span>Diterima Oleh,</span><span class="signature-space"></span><strong>________________________</strong></div>
          </footer>
        </section>`;
    }).join("");

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Tanda Terima Surat Jalan</title>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            * { box-sizing: border-box; }
            html, body { width: 281mm; margin: 0; padding: 0; color: #000; font: 8pt Arial, sans-serif; }
            .page { position: relative; width: 281mm; height: 194mm; overflow: hidden; break-after: page; page-break-after: always; }
            .page.last-page { break-after: auto; page-break-after: auto; }
            .letterhead { position: relative; display: flex; align-items: center; justify-content: center; height: 20mm; text-align: center; }
            .letterhead img { position: absolute; left: 4mm; top: 50%; width: 28mm; height: 23mm; object-fit: contain; transform: translateY(-50%); }
            .company { width: 100%; padding: 0 28mm; line-height: 1.3; }
            .company h1 { margin: 0 0 1mm; font-size: 12pt; }
            .company p { margin: 0.5mm 0; font-size: 7pt; }
            .title { margin: 3mm 0; text-align: center; font-size: 10pt; text-decoration: underline; }
            .date { margin: 0 0 1mm; font-size: 8pt; }
            table { width: 281mm; height: 81mm; border-collapse: collapse; table-layout: fixed; }
            th, td { height: 5mm; border: 1px solid #000; padding: 0.4mm 1mm; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
            th { font-size: 7.5pt; font-weight: 700; }
            td { font-size: 7pt; }
            .signatures { display: flex; justify-content: space-between; margin: 2mm 10mm 0; text-align: center; font-size: 7pt; }
            .signatures > div { display: flex; min-width: 60mm; flex-direction: column; align-items: center; }
            .signature-space { height: 12mm; }
            @media screen { body { width: auto; margin: 10mm auto; } .page { margin-bottom: 10mm; background: white; box-shadow: 0 1mm 4mm #999; } }
          </style>
        </head>
        <body>${renderedPages}</body>
      </html>`);
    printWindow.document.close();

    try {
      await Promise.all([
        printWindow.document.fonts.ready,
        ...Array.from(printWindow.document.images, (image) => image.decode()),
      ]);
      printWindow.focus();
      printWindow.print();
    } catch (printError) {
      printWindow.close();
      setSaveError(printError instanceof Error ? printError.message : "Gagal menyiapkan dokumen cetak.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-800">
            Administrasi Surat Jalan
          </span>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Pembukuan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Catatan tanda terima surat jalan berdasarkan data DO.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Segarkan
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredOrders.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={14} />
            Ekspor CSV
          </button>
          <button
            type="button"
            onClick={printPembukuan}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800"
          >
            <Printer size={14} />
            Cetak Formulir
          </button>
        </div>
      </div>

      <section className="no-print grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-semibold text-slate-700">
          Dari tanggal
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal"
          />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Sampai tanggal
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal"
          />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Status DO
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal"
          >
            <option value="TERKIRIM">Terkirim</option>
            <option value="ALL">Semua status</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Cari surat jalan
          <span className="relative mt-1 block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Distributor, MDO, no. surat jalan..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 font-normal"
            />
          </span>
        </label>
      </section>

      {(error || saveError) && (
        <p role="alert" className="no-print rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError || error}
        </p>
      )}

      <section className="no-print overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <CalendarDays size={16} className="text-blue-700" />
            Buku Tanda Terima Surat Jalan
          </div>
          <span className="text-xs text-slate-500">{filteredOrders.length} surat jalan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-50 uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-3 text-center">No</th>
                <th className="px-3 py-3">Distributor</th>
                <th className="px-3 py-3">Tgl MDO</th>
                <th className="px-3 py-3">MDO</th>
                <th className="px-3 py-3">No Surat Jalan</th>
                <th className="px-3 py-3">Lembar</th>
                <th className="px-3 py-3 text-center">Rit</th>
                {canEditLembar && <th className="px-3 py-3">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={canEditLembar ? 8 : 7} className="px-4 py-10 text-center text-slate-500">Memuat data pembukuan...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={canEditLembar ? 8 : 7} className="px-4 py-10 text-center text-slate-500">Tidak ada surat jalan pada filter ini.</td></tr>
              ) : filteredOrders.map((order, index) => (
                <tr key={order.id} className="text-slate-700 hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-center">{index + 1}</td>
                  <td className="px-3 py-2.5 font-semibold">{order.namaToko || order.namaPenerima || "-"}</td>
                  <td className="px-3 py-2.5">{formatDate(order.tglSchedule) || "-"}</td>
                  <td className="px-3 py-2.5 font-mono">{order.noSchedule || "-"}</td>
                  <td className="px-3 py-2.5 font-mono">{order.noDocPerusahaan || order.noDO || "-"}</td>
                  <td className="px-3 py-2.5">
                    {canEditLembar ? (
                      <input
                        value={getLembarValue(order)}
                        maxLength={100}
                        onChange={(event) => updateLembarDraft(order.id, event.target.value)}
                        aria-label={`Lembar surat jalan ${order.noDocPerusahaan || order.noDO}`}
                        className="w-24 rounded-md border border-slate-200 px-2 py-1"
                      />
                    ) : getLembarValue(order) || "-"}
                  </td>
                  <td className="px-3 py-2.5 text-center">{getOrderRit(order) || "-"}</td>
                  {canEditLembar && (
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        disabled={savingId === order.id || !Object.prototype.hasOwnProperty.call(lembarDrafts, order.id)}
                        onClick={() => saveLembar(order)}
                        className="rounded-md bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {savingId === order.id ? "Menyimpan..." : "Simpan"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
