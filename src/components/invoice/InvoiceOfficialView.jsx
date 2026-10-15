import React from "react";
import { CompanyKopSurat } from "../common/CompanyKopSurat";
import { formatRupiah, formatTanggal } from "../../utils/format";
import { Printer, X, FileText } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function InvoiceOfficialView({ invoice, onClose }) {
  if (!invoice) return null;

  const getDestination = (value) =>
    String(value || "-")
      .split(/\s*(?:->|[-–—])\s*/)
      .map((segment) => segment.trim())
      .filter(Boolean)
      .pop() || "-";

  const handlePrint = () => {
    window.print();
  };
  const verificationUrl = new URL(
    `/verifikasi/invoice/${encodeURIComponent(invoice.verificationToken || "")}`,
    window.location.origin
  ).toString();

  // Tanggal jatuh tempo (30 hari dari tanggal invoice)
  const tglInvoice = new Date(invoice.createdAt || invoice.tanggalInvoice || new Date());
  const tglJatuhTempo = new Date(tglInvoice);
  tglJatuhTempo.setDate(tglJatuhTempo.getDate() + 30);

  // Ambil data items / deliveryOrders
  const itemsList =
    (invoice.items && invoice.items.length > 0
      ? invoice.items
      : invoice.deliveryOrders) || [];

  const groupedItems = Object.values(
    itemsList.reduce((groups, item) => {
      const description =
        (item.namaBarang && item.namaBarang !== "-" ? item.namaBarang : "") ||
        item.keteranganDoc ||
        "Deskripsi belum tersedia";
      const area = item.tujuanKirim || getDestination(item.areaDistribusi);
      const unitPrice = Number(item.biayaEkspedisi ?? item.tarifPengiriman ?? 0);
      const key = JSON.stringify([description, area, unitPrice]);

      if (!groups[key]) {
        groups[key] = {
          description,
          area,
          unitPrice,
          quantity: 0,
          totalNetto: 0,
        };
      }

      const pph2 = Number(item.pph2 ?? Math.round(unitPrice * 0.02));
      const netto = Number(item.totalSetelahPPh ?? (unitPrice - pph2));
      groups[key].quantity += 1;
      groups[key].totalNetto += netto;
      return groups;
    }, {})
  );

  // Total tarif ekspedisi
  const totalBruto =
    Number(invoice.subtotal) ||
    itemsList.reduce((sum, it) => sum + Number(it.biayaEkspedisi || it.tarifPengiriman || 0), 0);
  const totalPPh2 = Number(
    invoice.totalPPh2 ??
      invoice.totalPPh ??
      itemsList.reduce(
        (sum, it) =>
          sum + Number(it.pph2 ?? Math.round(Number(it.biayaEkspedisi || 0) * 0.02)),
        0
      )
  );
  const totalTagihan = Number(
    invoice.totalTagihan ??
      invoice.totalBersih ??
      (totalBruto - totalPPh2)
  );

  return (
    <div className="space-y-4">
      {/* Tombol Aksi — Disembunyikan saat cetak */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="text-blue-700" size={18} />
              <span>Faktur Tagihan Resmi</span>
            </h3>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
              📄 Format Profesional
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
              {itemsList.length} DO Digabung
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Siap cetak A4 (210×297 mm) — klik tombol cetak untuk simpan PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition"
          >
            <Printer size={15} />
            <span>Cetak / Download PDF (A4)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            title="Tutup Pratinjau"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Screen Wrapper: Simulasi kertas A4 */}
      <div className="invoice-pages-wrapper w-full bg-slate-300 p-4 sm:p-8 rounded-2xl overflow-x-auto flex justify-center">
        {/* ============================================================
            AREA CETAK RESMI — ID dipakai oleh @media print di styles.css
            ============================================================ */}
        <div
          id="invoice-print-area"
          className="invoice-official-page invoice-document bg-white text-slate-900 box-border text-[10.5px] leading-snug"
          style={{
            width: "210mm",
            padding: 0,
            boxSizing: "border-box",
            fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
          }}
        >
          <section className="invoice-sheet invoice-sheet-first flex flex-col border border-slate-300 bg-white p-[10mm_12mm] shadow-2xl">
          {/* ── KOP SURAT ── */}
          <div className="mb-2">
            <CompanyKopSurat
              title="FAKTUR TAGIHAN (INVOICE)"
              subtitle="Dokumen Penagihan Jasa Ekspedisi & Angkutan Barang"
            />
          </div>

          {/* ── IDENTITAS FAKTUR & PENERIMA (2 kolom) ── */}
          <div className="grid grid-cols-2 gap-4 border-b border-slate-300 pb-2 mb-2">
            {/* Kiri: Ditujukan kepada */}
            <div className="space-y-0.5">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">
                DITUJUKAN KEPADA:
              </p>
              <p className="font-black text-slate-900 uppercase text-xs">
                {invoice.namaPelanggan}
              </p>
              {invoice.alamatPelanggan ? (
                <p className="text-slate-600 text-[10px] leading-snug">
                  {invoice.alamatPelanggan}
                </p>
              ) : (
                <p className="text-slate-400 italic text-[10px]">Alamat belum dicantumkan</p>
              )}
              {invoice.noPoCustomer && (
                <p className="text-[10px] text-slate-700 pt-0.5">
                  <span className="font-semibold">No. PO / Ref:</span>{" "}
                  <span className="font-mono font-bold text-slate-900">{invoice.noPoCustomer}</span>
                </p>
              )}
            </div>

            {/* Kanan: Rincian dokumen */}
            <div className="text-right space-y-0.5">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">
                RINCIAN DOKUMEN:
              </p>
              <p>
                <span className="text-slate-500">No. Faktur: </span>
                <span className="font-mono font-extrabold text-blue-950 text-xs">
                  {invoice.noInvoice}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Tanggal: </span>
                <span className="font-medium text-slate-800">
                  {formatTanggal(tglInvoice.toISOString())}
                </span>
              </p>
              <p className="print-hidden">
                <span className="text-slate-500">Jatuh Tempo: </span>
                <span className="font-semibold text-red-600">
                  {formatTanggal(tglJatuhTempo.toISOString())}
                </span>
              </p>
              <p className="pt-0.5 print-hidden">
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase ${
                    invoice.status === "LUNAS"
                      ? "bg-emerald-100 text-emerald-800"
                      : invoice.status === "DIBATALKAN"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {invoice.status === "LUNAS"
                    ? "LUNAS"
                    : invoice.status === "DIBATALKAN"
                    ? "DIBATALKAN"
                    : "BELUM DIBAYAR"}
                </span>
              </p>
            </div>
          </div>

          {/* ── TABEL RINCIAN TAGIHAN ── */}
          <div className="mb-2">
            <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Rincian Tagihan:
            </p>

            <div className="border border-slate-300 overflow-hidden">
              <table
                className="invoice-items-table w-full text-left border-collapse"
                style={{ fontSize: "8.5pt", tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "32%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "15%" }} />
                </colgroup>
                <thead>
                  <tr
                    className="border-b border-slate-300 text-slate-700 font-medium"
                    style={{ backgroundColor: "#e2e8f0", fontSize: "7.5pt" }}
                  >
                    <th className="px-1.5 py-1.5 text-center border-r border-slate-300">No</th>
                    <th className="px-1.5 py-1.5 border-r border-slate-300">Item Description</th>
                    <th className="px-1.5 py-1.5 border-r border-slate-300">Area</th>
                    <th className="px-1.5 py-1.5 text-center border-r border-slate-300">Qty</th>
                    <th className="px-1.5 py-1.5 text-center border-r border-slate-300">UoM</th>
                    <th className="px-1.5 py-1.5 text-right border-r border-slate-300">Unit Price</th>
                    <th className="px-1.5 py-1.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="invoice-lines-body">
                  {groupedItems.length > 0 ? (
                    groupedItems.map((item, idx) => (
                      <tr
                        key={`${item.description}-${item.unitPrice}`}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td className="px-1.5 py-1 text-center text-slate-500 font-semibold border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="px-1.5 py-1 font-semibold text-slate-900 border-r border-slate-200">
                          {item.description}
                        </td>
                        <td className="px-1.5 py-1 border-r border-slate-200">
                          {item.area}
                        </td>
                        <td className="px-1.5 py-1 text-center border-r border-slate-200">
                          {item.quantity}
                        </td>
                        <td className="px-1.5 py-1 text-center border-r border-slate-200">
                          DO
                        </td>
                        <td className="px-1.5 py-1 text-right font-mono whitespace-nowrap border-r border-slate-200">
                          {formatRupiah(item.unitPrice)}
                        </td>
                        <td className="px-1.5 py-1 text-right font-mono font-bold whitespace-nowrap">
                          {formatRupiah(item.totalNetto)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-slate-400 italic">
                        Tidak ada rincian surat jalan pengiriman
                      </td>
                    </tr>
                  )}
                  {groupedItems.length > 0 && groupedItems.length <= 4 && (
                    <tr className="invoice-table-filler" aria-hidden="true">
                      <td colSpan={7} />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>



          {/* ── RINGKASAN BIAYA & CATATAN PPH ── */}
          <div className="page-break-avoid mt-2 ml-auto w-full max-w-[320px]">
            <table className="invoice-totals-table w-full border-collapse text-[9pt]">
              <tbody>
                <tr>
                  <th className="border border-slate-300 px-2 py-1 text-right font-medium">Sub Total:</th>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">
                    {formatRupiah(totalBruto)}
                  </td>
                </tr>
                <tr>
                  <th className="border border-slate-300 px-2 py-1 text-right font-medium">PPh 2%:</th>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">
                    - {formatRupiah(totalPPh2)}
                  </td>
                </tr>
                <tr>
                  <th className="border border-slate-300 px-2 py-1 text-right font-bold">Grand Total:</th>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono font-bold">
                    {formatRupiah(totalTagihan)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── REKENING BANK & TANDA TANGAN ── */}
          <div className="page-break-avoid grid grid-cols-2 gap-6 items-end mt-4">
            {/* Rekening Bank */}
            <div
              className="rounded-lg border border-slate-200 p-2.5 space-y-1"
              style={{ backgroundColor: "#f8fafc" }}
            >
              <p className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1" style={{ fontSize: "8.5pt" }}>
                💳 Rekening Pembayaran Resmi:
              </p>
              <div
                className="bg-white p-2 rounded border border-slate-200 space-y-0.5"
                style={{ fontSize: "9pt" }}
              >
                <p className="text-slate-900">
                  Bank Mandiri :{" "}
                  <span className="font-mono font-bold text-blue-900">133-00-293819-2</span>
                </p>
                <p className="text-slate-900">
                  Bank BCA :{" "}
                  <span className="font-mono font-bold text-blue-900">8830-192-888</span>
                </p>
                <p className="text-slate-600 pt-0.5" style={{ fontSize: "8.5pt" }}>
                  Atas Nama :{" "}
                  <strong>PT ALMAIRA YUNIAR TREK</strong>
                </p>
              </div>
              <p className="text-slate-500 italic" style={{ fontSize: "7.5pt" }}>
                * Cantumkan No. Faktur pada berita transfer dan kirim bukti ke{" "}
                <strong>almirayuniartrek@gmail.com</strong>
              </p>
            </div>

            {/* Tanda Tangan Direktur */}
            <div className="flex justify-end">
              <div
                className="flex flex-col justify-between rounded-lg border border-slate-300 bg-white text-center"
                style={{ width: "170px", minHeight: "150px", padding: "10px 10px 8px" }}
              >
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider" style={{ fontSize: "8pt" }}>
                    Hormat Kami,
                  </p>
                  <p className="font-bold text-slate-900" style={{ fontSize: "9pt" }}>
                    PT ALMAIRA YUNIAR TREK
                  </p>
                </div>

                <div className="flex flex-col items-center pt-1">
                  {invoice.verificationToken ? (
                    <QRCodeSVG
                      value={verificationUrl}
                      size={82}
                      level="H"
                      imageSettings={{
                        src: "/assets/logo.jpg",
                        width: 22,
                        height: 22,
                        excavate: true,
                      }}
                      aria-label={`QR verifikasi invoice ${invoice.noInvoice}`}
                    />
                  ) : (
                    <span className="py-5 text-center text-red-600" style={{ fontSize: "7pt" }}>
                      Token QR belum tersedia. Jalankan migrasi database.
                    </span>
                  )}
                  <span className="mt-1 text-slate-500" style={{ fontSize: "6.5pt" }}>
                    Pindai untuk verifikasi
                  </span>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "8px" }}>
                  <p className="font-black text-slate-900 underline underline-offset-2 uppercase tracking-wider" style={{ fontSize: "9.5pt" }}>
                    {invoice.dibuatOleh?.role === "DIREKTUR"
                      ? invoice.dibuatOleh.nama || "DIREKTUR UTAMA"
                      : "BELUM DISAHKAN"}
                  </p>
                  <p className="text-slate-500" style={{ fontSize: "7.5pt" }}>
                    {invoice.dibuatOleh?.role === "DIREKTUR" ? "Direktur Utama" : "PT Almaira Yuniar Trek"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER DOKUMEN ── */}
          <div
            className="mt-auto pt-3 border-t border-slate-200"
            style={{ marginTop: "auto", borderTop: "1px solid #e2e8f0", paddingTop: "6px" }}
          >
            <p className="text-center text-slate-400 italic" style={{ fontSize: "7.5pt" }}>
              Dokumen ini dicetak secara otomatis oleh Sistem Manajemen Pengiriman PT Almaira Yuniar Trek —{" "}
              Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          </section>

          <section className="invoice-sheet invoice-sheet-recap border border-slate-300 bg-white p-[10mm_12mm] shadow-2xl">
            <div className="mb-3">
              <CompanyKopSurat
                title="LAMPIRAN REKAP SURAT JALAN"
                subtitle={`Invoice ${invoice.noInvoice}`}
              />
            </div>
            <div className="mb-3 border-b border-slate-400 pb-2 text-[9pt]">
              <p><strong>Pelanggan:</strong> {invoice.namaPelanggan}</p>
              <p><strong>Alamat:</strong> {invoice.alamatPelanggan || "-"}</p>
              <p><strong>Tanggal Invoice:</strong> {formatTanggal(tglInvoice.toISOString())}</p>
            </div>

            <table className="invoice-recap-table w-full border-collapse text-left">
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>No. Schedule</th>
                  <th>No. Surat Jalan</th>
                  <th>Tanggal</th>
                  <th>Rit</th>
                  <th>Tujuan</th>
                  <th>Tarif Bruto</th>
                  <th>Netto (PPh 2%)</th>
                </tr>
              </thead>
              <tbody>
                {itemsList.length > 0 ? itemsList.map((item, index) => {
                  const tarif = Number(item.biayaEkspedisi ?? item.tarifPengiriman ?? 0);
                  const pph2 = Number(item.pph2 ?? Math.round(tarif * 0.02));
                  const netto = Number(item.totalSetelahPPh ?? item.totalSetelahPph ?? tarif - pph2);
                  return (
                    <tr key={item.deliveryOrderId || item.id || index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{item.noSchedule || "-"}</td>
                      <td>{item.noDocPerusahaan || item.noDO || "-"}</td>
                      <td className="text-center">{formatTanggal(item.tanggalKirim || item.tglDocPerusahaan)}</td>
                      <td className="text-center">{String(item.tipeMobilRit || "1").match(/\d+/)?.[0] || "1"}</td>
                      <td>{getDestination(item.tujuanKirim || item.areaDistribusi)}</td>
                      <td className="text-right whitespace-nowrap">{formatRupiah(tarif)}</td>
                      <td className="text-right whitespace-nowrap">{formatRupiah(netto)}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center italic">Tidak ada rincian surat jalan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
