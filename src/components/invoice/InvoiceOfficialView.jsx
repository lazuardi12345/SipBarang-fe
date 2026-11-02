import React, { useRef } from "react";
import { CompanyKopSurat } from "../common/CompanyKopSurat";
import { formatRupiah, formatTanggal } from "../../utils/format";
import { Printer, X, FileText } from "lucide-react";

function getDocumentNumbers(item) {
  const numbers = String(item.noDocPerusahaan || item.noSchedule || "")
    .split(/[,;\n]+/)
    .map((number) => number.trim())
    .filter(Boolean);
  return numbers.length > 0 ? numbers : ["-"];
}

function getInvoiceItemAmounts(item) {
  const tarif = Number(item.biayaEkspedisi ?? item.tarifPengiriman ?? 0);
  const pph2 = Math.round(tarif * 0.02);
  return { tarif, pph2, total: tarif - pph2 };
}

export function InvoiceOfficialView({ invoice, onClose }) {
  const printAreaRef = useRef(null);
  if (!invoice) return null;

  const getDestination = (value) =>
    String(value || "-")
      .split(/\s*(?:->|[-–—])\s*/)
      .map((segment) => segment.trim())
      .filter(Boolean)
      .pop() || "-";

  const handlePrint = async () => {
    const printArea = printAreaRef.current;
    if (!printArea) {
      window.alert("Area invoice tidak ditemukan untuk dicetak.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.alert("Jendela cetak diblokir browser. Izinkan pop-up, lalu coba cetak kembali.");
      return;
    }

    const printDocument = printWindow.document;
    printDocument.open();
    printDocument.write("<!doctype html><html><head></head><body></body></html>");
    printDocument.close();

    const base = printDocument.createElement("base");
    base.href = document.baseURI;
    printDocument.head.appendChild(base);

    const title = printDocument.createElement("title");
    title.textContent = `Invoice ${invoice.noInvoice}`;
    printDocument.head.appendChild(title);

    const stylesheets = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]')
    ).map((stylesheet) => {
      const copy = printDocument.createElement("link");
      copy.rel = "stylesheet";
      copy.href = stylesheet.href;
      const loaded = new Promise((resolve, reject) => {
        copy.onload = resolve;
        copy.onerror = () => reject(new Error("Stylesheet invoice gagal dimuat untuk cetak."));
      });
      printDocument.head.appendChild(copy);
      return loaded;
    });

    document.querySelectorAll("style").forEach((style) => {
      const copy = printDocument.createElement("style");
      copy.textContent = style.textContent;
      printDocument.head.appendChild(copy);
    });

    const printStyles = printDocument.createElement("style");
    printStyles.textContent = `
      @page {
        size: 210mm 330mm;
        margin: 8mm 0;
      }

      html, body {
        width: 210mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
      }

      body {
        color: #000;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      #invoice-print-area.invoice-official-page.invoice-document {
        display: block !important;
        width: 210mm !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      #invoice-print-area.invoice-official-page.invoice-document .invoice-pages-wrapper {
        display: block !important;
        width: 210mm !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #fff !important;
      }

      #invoice-print-area.invoice-official-page.invoice-document .invoice-sheet {
        width: 210mm !important;
        height: auto !important;
        min-height: 314mm !important;
        max-height: none !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 10mm 12mm !important;
        overflow: visible !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background: #fff !important;
      }

      #invoice-print-area.invoice-official-page.invoice-document .invoice-sheet-first {
        break-after: page !important;
        page-break-after: always !important;
      }

      #invoice-print-area .company-letterhead {
        width: calc(100% + 21.2mm) !important;
        margin: -4.6mm -10.6mm 0 !important;
      }

      #invoice-print-area .company-letterhead > div:first-child {
        height: 37.3mm !important;
        box-sizing: border-box !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 1.2mm !important;
        padding: 0 0 0 2.6mm !important;
      }

      #invoice-print-area .company-letterhead-logo {
        display: block !important;
        width: 51mm !important;
        height: 37.3mm !important;
        max-width: none !important;
        object-fit: contain !important;
      }

      #invoice-print-area .company-letterhead > div:first-child > div:last-child {
        flex: none !important;
        width: 115mm !important;
        text-align: center !important;
      }

      #invoice-print-area .company-letterhead-name {
        margin: 0 !important;
        color: #111 !important;
        font-family: "Copperplate Gothic Bold", Copperplate, "Palatino Linotype", Georgia, serif !important;
        font-size: 18pt !important;
        line-height: 1.1 !important;
        letter-spacing: 0 !important;
      }

      #invoice-print-area .company-letterhead-address,
      #invoice-print-area .company-letterhead-contact {
        margin-top: 0.5mm !important;
        color: #222 !important;
        font-family: Calibri, Arial, sans-serif !important;
        font-size: 12pt !important;
        line-height: 1.1 !important;
      }

      #invoice-print-area .company-letterhead-contact-inline {
        display: none !important;
      }

      #invoice-print-area .company-letterhead-contact-print {
        display: block !important;
      }

      #invoice-print-area .company-letterhead > div:nth-child(2) {
        border-color: #1f497d !important;
      }

      #invoice-print-area .company-letterhead > div:nth-child(3) {
        margin-top: 0.25mm !important;
        border-color: #1f497d !important;
      }

      #invoice-print-area .no-print,
      #invoice-print-area .print-hidden {
        display: none !important;
      }
    `;
    printDocument.head.appendChild(printStyles);

    printDocument.body.appendChild(printDocument.importNode(printArea, true));

    try {
      await Promise.all(stylesheets);
      await printDocument.fonts.ready;
      await Promise.all(
        Array.from(printDocument.images, (image) =>
          image.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                image.onload = resolve;
                image.onerror = resolve;
              })
        )
      );
      printWindow.onafterprint = () => printWindow.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      printWindow.close();
      window.alert(error instanceof Error ? error.message : "Gagal menyiapkan invoice untuk dicetak.");
    }
  };

  const tglInvoice = new Date(invoice.tanggalInvoice || new Date());

  // Ambil data items / deliveryOrders
  const itemsList =
    (invoice.items && invoice.items.length > 0
      ? invoice.items
      : invoice.deliveryOrders) || [];
  const recapItems = itemsList.flatMap((item) =>
    getDocumentNumbers(item).map((documentNumber, documentIndex, documentNumbers) => ({
      item,
      documentNumber,
      documentIndex,
      documentCount: documentNumbers.length,
    }))
  );

  const groupedItems = Object.values(
    itemsList.reduce((groups, item) => {
      const destination = item.tujuanKirim || getDestination(item.areaDistribusi);
      const unitPrice = Number(item.biayaEkspedisi ?? item.tarifPengiriman ?? 0);
      const key = JSON.stringify([destination.trim().toLocaleLowerCase("id-ID"), unitPrice]);

      if (!groups[key]) {
        groups[key] = {
          description: destination,
          unitPrice,
          quantity: 0,
          amount: 0,
        };
      }

      groups[key].quantity += 1;
      groups[key].amount += unitPrice;
      return groups;
    }, {})
  );

  // Total tarif ekspedisi
  const invoiceAmounts = itemsList.map(getInvoiceItemAmounts);
  const totalBruto = invoiceAmounts.reduce((sum, item) => sum + item.tarif, 0);
  const totalPPh2 = invoiceAmounts.reduce((sum, item) => sum + item.pph2, 0);
  const totalTagihan = invoiceAmounts.reduce((sum, item) => sum + item.total, 0);

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
            Siap cetak F4 / Folio (210×330 mm) — klik tombol cetak untuk simpan PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition"
          >
            <Printer size={15} />
            <span>Cetak / Download PDF (F4)</span>
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

      {/* Screen Wrapper: Simulasi kertas F4 */}
      <div className="invoice-pages-wrapper w-full bg-slate-300 p-4 sm:p-8 rounded-2xl overflow-x-auto flex justify-center">
        {/* ============================================================
            AREA CETAK RESMI — ID dipakai oleh @media print di styles.css
            ============================================================ */}
        <div
          ref={printAreaRef}
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
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "36%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "18.5%" }} />
                  <col style={{ width: "18.5%" }} />
                </colgroup>
                <thead>
                  <tr
                    className="border-b border-slate-300 text-slate-700 font-medium"
                    style={{ backgroundColor: "#e2e8f0", fontSize: "7.5pt" }}
                  >
                    <th className="px-1.5 py-1.5 text-center border-r border-slate-300">No</th>
                    <th className="px-1.5 py-1.5 border-r border-slate-300">Description</th>
                    <th className="px-1.5 py-1.5 text-center border-r border-slate-300">UoM</th>
                    <th className="px-1.5 py-1.5 text-center border-r border-slate-300">Qty</th>
                    <th className="px-1.5 py-1.5 text-right border-r border-slate-300">Unit Cost</th>
                    <th className="px-1.5 py-1.5 text-right">Unit Price Amount</th>
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
                        <td className="px-1.5 py-1 text-center border-r border-slate-200">
                          DO
                        </td>
                        <td className="px-1.5 py-1 text-center border-r border-slate-200">
                          {item.quantity}
                        </td>
                        <td className="px-1.5 py-1 text-right font-mono whitespace-nowrap border-r border-slate-200">
                          {formatRupiah(item.unitPrice)}
                        </td>
                        <td className="px-1.5 py-1 text-right font-mono font-bold whitespace-nowrap">
                          {formatRupiah(item.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-slate-400 italic">
                        Tidak ada rincian surat jalan pengiriman
                      </td>
                    </tr>
                  )}
                  {groupedItems.length > 0 && groupedItems.length <= 4 && (
                    <tr className="invoice-table-filler" aria-hidden="true">
                      <td colSpan={6} />
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
                  Silakan transfer ke rekening perusahaan:
                  <br />
                  BCA :{" "}
                  <span className="font-mono font-bold text-blue-900">5721.904.530</span>
                </p>
                <p className="text-slate-600 pt-0.5" style={{ fontSize: "8.5pt" }}>
                  <span className="font-semibold">Atas Nama :</span>{" "}
                  <strong>PT ALMAIRA YUNIAR TREK</strong>
                </p>
              </div>
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

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "8px" }}>
                  <p className="font-black text-slate-900 underline underline-offset-2 uppercase tracking-wider" style={{ fontSize: "9.5pt" }}>
                    M Syahril
                  </p>
                  <p className="text-slate-500" style={{ fontSize: "7.5pt" }}>
                    Direktur Utama
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
                <col style={{ width: "12%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>NO. SCHEDULE</th>
                  <th>NO. DOC</th>
                  <th>RIT</th>
                  <th>TANGGAL</th>
                  <th>AREA</th>
                  <th>TARIF</th>
                  <th>PPH 2%</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {recapItems.length > 0 ? recapItems.map(({ item, documentNumber, documentIndex, documentCount }, index) => {
                  const { tarif, pph2, total } = getInvoiceItemAmounts(item);
                  return (
                    <tr key={`${item.deliveryOrderId || item.id || index}-${documentIndex}`}>
                      {documentIndex === 0 && (
                        <>
                          <td rowSpan={documentCount}>{item.noSchedule || "-"}</td>
                          <td>{documentNumber === "-" ? "-" : documentNumber}</td>
                          <td rowSpan={documentCount} className="text-center">{String(item.tipeMobilRit || "1").match(/\d+/)?.[0] || "1"}</td>
                          <td rowSpan={documentCount} className="text-center">{formatTanggal(item.tanggalKirim || item.tglDocPerusahaan)}</td>
                          <td rowSpan={documentCount}>{getDestination(item.tujuanKirim || item.areaDistribusi)}</td>
                          <td rowSpan={documentCount} className="text-right whitespace-nowrap">{formatRupiah(tarif)}</td>
                          <td rowSpan={documentCount} className="text-right whitespace-nowrap">- {formatRupiah(pph2)}</td>
                          <td rowSpan={documentCount} className="text-right whitespace-nowrap font-semibold">{formatRupiah(total)}</td>
                        </>
                      )}
                      {documentIndex > 0 && <td>{documentNumber}</td>}
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center italic">Tidak ada rincian surat jalan.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="page-break-avoid mt-8" style={{ display: "flow-root" }}>
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

                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "8px" }}>
                    <p className="font-black text-slate-900 underline underline-offset-2 uppercase tracking-wider" style={{ fontSize: "9.5pt" }}>
                      M Syahril
                    </p>
                    <p className="text-slate-500" style={{ fontSize: "7.5pt" }}>
                      Direktur Utama
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
