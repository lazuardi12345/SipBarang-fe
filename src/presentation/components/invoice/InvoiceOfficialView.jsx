import React from "react";
import { CompanyKopSurat } from "../common/CompanyKopSurat";
import { formatRupiah, formatTanggal } from "../../../lib/format";
import { Printer, X, FileText } from "lucide-react";

export function InvoiceOfficialView({ invoice, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  // Tanggal jatuh tempo (30 hari dari tanggal invoice)
  const tglInvoice = new Date(invoice.createdAt || invoice.tanggalInvoice || new Date());
  const tglJatuhTempo = new Date(tglInvoice);
  tglJatuhTempo.setDate(tglJatuhTempo.getDate() + 30);

  // Ambil data items / deliveryOrders
  const itemsList =
    (invoice.items && invoice.items.length > 0
      ? invoice.items
      : invoice.deliveryOrders) || [];

  // Total tarif ekspedisi
  const totalBruto =
    Number(invoice.subtotal) ||
    itemsList.reduce((sum, it) => sum + Number(it.biayaEkspedisi || it.tarifPengiriman || 0), 0);

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
              📄 Format A4
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
      <div className="w-full bg-slate-300 p-4 sm:p-8 rounded-2xl overflow-x-auto flex justify-center">
        {/* ============================================================
            AREA CETAK RESMI — ID dipakai oleh @media print di styles.css
            ============================================================ */}
        <div
          id="invoice-print-area"
          className="
            bg-white text-slate-900 shadow-2xl border border-slate-300
            flex flex-col
            box-border
            text-[10.5px] leading-snug
          "
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "10mm 12mm",
            boxSizing: "border-box",
            fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
          }}
        >
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
              <p>
                <span className="text-slate-500">Jatuh Tempo: </span>
                <span className="font-semibold text-red-600">
                  {formatTanggal(tglJatuhTempo.toISOString())}
                </span>
              </p>
              <p className="pt-0.5">
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

          {/* ── TABEL RINCIAN PENGIRIMAN ── */}
          <div className="mb-2">
            <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Rincian Pengiriman yang Digabungkan ({itemsList.length} Surat Jalan):
            </p>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table
                className="w-full text-left border-collapse"
                style={{ fontSize: "8.5pt", tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "15%" }} />
                </colgroup>
                <thead>
                  <tr
                    className="border-b border-slate-300 text-slate-700 font-bold uppercase"
                    style={{ backgroundColor: "#e2e8f0", fontSize: "7.5pt" }}
                  >
                    <th className="px-1.5 py-1.5 text-center border-r border-slate-300">No</th>
                    <th className="px-1.5 py-1.5 border-r border-slate-300">No. DO</th>
                    <th className="px-1.5 py-1.5 border-r border-slate-300">No. SJ Pabrik</th>
                    <th className="px-1.5 py-1.5 border-r border-slate-300">Toko / Depo Tujuan</th>
                    <th className="px-1.5 py-1.5 border-r border-slate-300">Supir & Plat</th>
                    <th className="px-1.5 py-1.5 border-r border-slate-300">Muatan Barang</th>
                    <th className="px-1.5 py-1.5 text-right">Tarif Ekspedisi</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsList.length > 0 ? (
                    itemsList.map((do_, idx) => {
                      const tarif = Number(do_.biayaEkspedisi ?? do_.tarifPengiriman ?? 0);
                      return (
                        <tr
                          key={do_.deliveryOrderId || do_.id || idx}
                          style={{ borderBottom: "1px solid #e2e8f0" }}
                        >
                          <td className="px-1.5 py-1 text-center text-slate-500 font-semibold border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="px-1.5 py-1 border-r border-slate-200">
                            <span className="font-mono font-bold text-slate-900 block overflow-hidden text-ellipsis whitespace-nowrap">
                              {do_.noDO}
                            </span>
                            <span className="text-[7.5pt] text-slate-400">
                              {formatTanggal(do_.tanggalKirim)}
                            </span>
                          </td>
                          <td className="px-1.5 py-1 font-mono text-slate-700 border-r border-slate-200 overflow-hidden text-ellipsis whitespace-nowrap">
                            {do_.noDocPerusahaan && do_.noDocPerusahaan !== "-" ? (
                              <span className="font-bold text-slate-800">{do_.noDocPerusahaan}</span>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="px-1.5 py-1 border-r border-slate-200">
                            <span className="font-bold text-slate-900 block overflow-hidden text-ellipsis whitespace-nowrap">
                              {do_.namaToko || do_.namaPenerima || "-"}
                            </span>
                            <span
                              className="text-slate-500 block overflow-hidden text-ellipsis whitespace-nowrap"
                              style={{ fontSize: "7pt" }}
                            >
                              {do_.tujuanKirim}
                              {do_.areaDistribusi ? ` (${do_.areaDistribusi})` : ""}
                            </span>
                          </td>
                          <td className="px-1.5 py-1 border-r border-slate-200">
                            <span className="font-medium text-slate-800 block overflow-hidden text-ellipsis whitespace-nowrap">
                              {do_.namaSupir || "-"}
                            </span>
                            <span
                              className="font-mono uppercase text-slate-500"
                              style={{ fontSize: "7pt" }}
                            >
                              {do_.noPolisiKendaraan || "-"}
                            </span>
                          </td>
                          <td className="px-1.5 py-1 border-r border-slate-200">
                            <span className="text-slate-700 block overflow-hidden text-ellipsis whitespace-nowrap">
                              {do_.namaBarang || "-"}
                            </span>
                            {do_.jumlahKoli > 0 && (
                              <span className="font-bold text-purple-700" style={{ fontSize: "7pt" }}>
                                [{do_.jumlahKoli} Koli]
                              </span>
                            )}
                          </td>
                          <td className="px-1.5 py-1 text-right font-semibold text-slate-800 whitespace-nowrap">
                            {formatRupiah(tarif)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-slate-400 italic">
                        Tidak ada rincian surat jalan pengiriman
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Footer tabel — subtotal */}
                {itemsList.length > 0 && (
                  <tfoot style={{ borderTop: "2px solid #cbd5e1", backgroundColor: "#f8fafc" }}>
                    <tr>
                      <td
                        colSpan={6}
                        className="px-2 py-1.5 text-right font-bold text-slate-700 uppercase border-r border-slate-300"
                        style={{ fontSize: "8pt" }}
                      >
                        Subtotal Biaya Ekspedisi ({itemsList.length} Pengiriman):
                      </td>
                      <td className="px-2 py-1.5 text-right font-black text-slate-900 whitespace-nowrap" style={{ fontSize: "9pt" }}>
                        {formatRupiah(totalBruto)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>



          {/* ── REKENING BANK & TANDA TANGAN ── */}
          <div className="page-break-avoid grid grid-cols-2 gap-4 items-end">
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
                style={{ width: "160px", height: "100px", padding: "8px" }}
              >
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider" style={{ fontSize: "8pt" }}>
                    Hormat Kami,
                  </p>
                  <p className="font-bold text-slate-900" style={{ fontSize: "9pt" }}>
                    PT ALMAIRA YUNIAR TREK
                  </p>
                </div>

                <div className="text-slate-300 italic" style={{ fontSize: "8pt" }}>
                  ( Tanda Tangan & Stempel )
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "4px" }}>
                  <p className="font-black text-slate-900 underline underline-offset-2 uppercase tracking-wider" style={{ fontSize: "9.5pt" }}>
                    DIREKTUR UTAMA
                  </p>
                  <p className="text-slate-500" style={{ fontSize: "7.5pt" }}>
                    PT Almaira Yuniar Trek
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
        </div>
      </div>
    </div>
  );
}
