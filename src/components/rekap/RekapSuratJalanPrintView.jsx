import React from "react";
import { formatRupiah } from "../../utils/format";
import { Printer, X } from "lucide-react";

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

function extractCleanArea(val) {
  if (!val) return "-";
  const str = String(val).trim();
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
}

export function RekapSuratJalanPrintView({
  orders = [],
  companyInfo = {
    nama: "PT ALMIRA YUNIAR TREK",
    singkatan: "AYT",
    alamat:
      "Jl. Kosambi Raya No. 45, Klari, Karawang Timur, Jawa Barat 41371",
    telepon: "081289123456",
    email: "almirayuniartrek@gmail.com",
  },
  customerInfo = {
    nama: "PT. CIPTAPAPAN DINAMIKA",
    alamat: "Graha GRC Board Lt. 3, Jl. S. Parman kav. 64, Jakarta 11410",
  },
  periodeText = "",
  onClose,
}) {
  const handlePrint = () => {
    window.print();
  };

  // Grouping orders by noSchedule agar jika 1 schedule ada beberapa no doc,
  // baris tarif dan total - PPh 2% digabung (rowspan) persis seperti foto dokumen fisik.
  const groupedList = React.useMemo(() => {
    const groups = [];
    const map = new Map();

    orders.forEach((order) => {
      // Kunci grouping: noSchedule jika ada, jika tidak ada fallback ke id order
      const key = order.noSchedule?.trim()
        ? `${order.noSchedule.trim()}_${order.tipeMobilRit || "1"}`
        : `single_${order.id}`;

      if (!map.has(key)) {
        const itemGroup = {
          key,
          noSchedule: order.noSchedule || "-",
          rit: extractRitNumber(order.tipeMobilRit),
          tanggal: order.tanggalKirim || order.tglDocPerusahaan,
          area: extractCleanArea(order.tujuanKirim || order.areaDistribusi || "-"),
          tarif: Number(order.biayaEkspedisi || 0),
          pph2: Number(order.pph2Persen ?? Math.round(Number(order.biayaEkspedisi || 0) * 0.02)),
          totalSetelahPPh: Number(
            order.totalSetelahPPh ??
              (Number(order.biayaEkspedisi || 0) -
                Math.round(Number(order.biayaEkspedisi || 0) * 0.02))
          ),
          docs: [
            {
              id: order.id,
              noDocPerusahaan: order.noDocPerusahaan || order.noDO || "-",
              order,
            },
          ],
        };
        map.set(key, itemGroup);
        groups.push(itemGroup);
      } else {
        const existing = map.get(key);
        existing.docs.push({
          id: order.id,
          noDocPerusahaan: order.noDocPerusahaan || order.noDO || "-",
          order,
        });
      }
    });

    return groups;
  }, [orders]);

  // Kalkulasi total
  const totalTarif = groupedList.reduce((sum, g) => sum + g.tarif, 0);
  const totalPPh2 = groupedList.reduce((sum, g) => sum + g.pph2, 0);
  const grandTotal = groupedList.reduce((sum, g) => sum + g.totalSetelahPPh, 0);

  function extractRitNumber(val) {
    if (!val) return "1";
    const match = String(val).match(/\d+/);
    return match ? match[0] : "1";
  }

  return (
    <div className="space-y-4">
      {/* Tombol Aksi — Disembunyikan saat dicetak */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Pratinjau Rekap Surat Jalan</span>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              {orders.length} Surat Jalan
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Format resmi identik dengan dokumen fisik penagihan ekspedisi (Siap cetak A4).
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
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              title="Tutup Pratinjau"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Screen Wrapper: Lembar Kertas A4 */}
      <div className="w-full bg-slate-200/90 p-3 sm:p-6 rounded-2xl overflow-x-auto flex justify-center">
        <div
          id="invoice-print-area"
          className="bg-white text-slate-900 shadow-xl border border-slate-300 flex flex-col box-border"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "12mm 15mm",
            boxSizing: "border-box",
            fontFamily: "'Times New Roman', 'Arial', serif",
            color: "#000",
          }}
        >
          {/* ── KOP SURAT ── */}
          <div className="border-b-2 border-black pb-3 mb-3">
            <div className="flex items-start gap-4">
              {/* Logo / Singkatan */}
              <div className="shrink-0 flex flex-col items-center justify-center">
                <div
                  className="rounded-full border-2 border-blue-900 flex items-center justify-center"
                  style={{ width: "70px", height: "45px" }}
                >
                  <span className="text-xl font-black text-blue-900 tracking-tighter italic">
                    {companyInfo.singkatan || "AYT"}
                  </span>
                </div>
                <span className="text-[7pt] font-bold text-blue-950 uppercase mt-0.5 tracking-tight text-center">
                  {companyInfo.nama}
                </span>
              </div>

              {/* Teks Identitas Perusahaan */}
              <div className="flex-1 text-center pr-10">
                <h1 className="text-base font-extrabold tracking-wide uppercase text-slate-950">
                  {companyInfo.nama}
                </h1>
                <p className="text-[8.5pt] leading-tight text-slate-800 mt-1">
                  {companyInfo.alamat}
                </p>
                <p className="text-[8.5pt] text-slate-800 mt-0.5">
                  No. Telepon: {companyInfo.telepon}
                  {companyInfo.email ? `, E-mail: ${companyInfo.email}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* ── JUDUL DOKUMEN ── */}
          <div className="text-center my-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              REKAP SURAT JALAN
            </h2>
            {periodeText && (
              <p className="text-[8.5pt] italic text-slate-700">Periode: {periodeText}</p>
            )}
          </div>

          {/* ── INFORMASI PELANGGAN ── */}
          <div className="mb-3 text-[9pt] leading-tight space-y-1">
            <div className="flex">
              <span className="w-20 font-semibold text-black">Untuk</span>
              <span className="w-4 font-semibold text-black">:</span>
              <span className="font-bold text-black uppercase">{customerInfo.nama}</span>
            </div>
            <div className="flex">
              <span className="w-20 font-semibold text-black">Alamat</span>
              <span className="w-4 font-semibold text-black">:</span>
              <span className="text-black">{customerInfo.alamat}</span>
            </div>
          </div>

          {/* ── TABEL REKAP 7 KOLOM DENGAN ROWSPAN PERSIS SEPERTI FOTO ── */}
          <div className="w-full">
            <table
              className="w-full text-[8.5pt] border-collapse"
              style={{
                border: "1.5px solid #000",
                color: "#000",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f1f5f9",
                    borderBottom: "1.5px solid #000",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  <th style={{ border: "1px solid #000", padding: "4px 3px", width: "16%" }}>
                    NOMOR SCHEDULE
                  </th>
                  <th style={{ border: "1px solid #000", padding: "4px 3px", width: "16%" }}>
                    NOMOR DOC
                  </th>
                  <th style={{ border: "1px solid #000", padding: "4px 3px", width: "13%" }}>
                    TANGGAL
                  </th>
                  <th style={{ border: "1px solid #000", padding: "4px 3px", width: "6%" }}>
                    RIT
                  </th>
                  <th style={{ border: "1px solid #000", padding: "4px 3px", width: "15%" }}>
                    AREA
                  </th>
                  <th style={{ border: "1px solid #000", padding: "4px 3px", width: "17%" }}>
                    TARIF
                  </th>
                  <th style={{ border: "1px solid #000", padding: "4px 3px", width: "17%" }}>
                    TOTAL - PPh 2%
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-6 text-slate-500 italic"
                      style={{ border: "1px solid #000" }}
                    >
                      Tidak ada data surat jalan pada periode yang dipilih.
                    </td>
                  </tr>
                ) : (
                  groupedList.map((group) => {
                    const rowCount = group.docs.length;
                    return group.docs.map((docItem, index) => {
                      const isFirst = index === 0;
                      return (
                        <tr
                          key={`${group.key}-${docItem.id}-${index}`}
                          style={{
                            borderBottom:
                              index === rowCount - 1 ? "1.5px solid #000" : "1px solid #cbd5e1",
                          }}
                        >
                          {/* NOMOR SCHEDULE (Rowspan) */}
                          {isFirst && (
                            <td
                              rowSpan={rowCount}
                              className="text-center align-middle font-mono font-semibold"
                              style={{ border: "1px solid #000", padding: "3px 4px" }}
                            >
                              {group.noSchedule}
                            </td>
                          )}

                          {/* NOMOR DOC (Per Baris) */}
                          <td
                            className="text-center font-mono"
                            style={{ border: "1px solid #000", padding: "3px 4px" }}
                          >
                            {docItem.noDocPerusahaan}
                          </td>

                          {/* TANGGAL (Rowspan) */}
                          {isFirst && (
                            <td
                              rowSpan={rowCount}
                              className="text-center align-middle font-mono"
                              style={{ border: "1px solid #000", padding: "3px 4px" }}
                            >
                              {formatTanggalSingkat(group.tanggal)}
                            </td>
                          )}

                          {/* RIT (Rowspan) */}
                          {isFirst && (
                            <td
                              rowSpan={rowCount}
                              className="text-center align-middle"
                              style={{ border: "1px solid #000", padding: "3px 2px" }}
                            >
                              {group.rit}
                            </td>
                          )}

                          {/* AREA (Rowspan) */}
                          {isFirst && (
                            <td
                              rowSpan={rowCount}
                              className="align-middle px-1.5"
                              style={{ border: "1px solid #000", padding: "3px 4px" }}
                            >
                              {group.area}
                            </td>
                          )}

                          {/* TARIF (Rowspan) */}
                          {isFirst && (
                            <td
                              rowSpan={rowCount}
                              className="align-middle"
                              style={{ border: "1px solid #000", padding: "3px 4px" }}
                            >
                              <div className="flex justify-between items-center px-1">
                                <span>Rp</span>
                                <span className="font-mono text-right">
                                  {Number(group.tarif || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* TOTAL - PPh 2% (Rowspan) */}
                          {isFirst && (
                            <td
                              rowSpan={rowCount}
                              className="align-middle font-bold"
                              style={{ border: "1px solid #000", padding: "3px 4px" }}
                            >
                              <div className="flex justify-between items-center px-1">
                                <span>Rp</span>
                                <span className="font-mono text-right">
                                  {Number(group.totalSetelahPPh || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>

              {/* FOOTER TOTAL */}
              {groupedList.length > 0 && (
                <tfoot>
                  <tr
                    style={{
                      borderTop: "2px solid #000",
                      backgroundColor: "#f8fafc",
                      fontWeight: "bold",
                    }}
                  >
                    <td
                      colSpan={5}
                      className="text-right uppercase px-3 py-1.5"
                      style={{ border: "1px solid #000", fontSize: "9pt" }}
                    >
                      TOTAL ({groupedList.length} RIT / {orders.length} DOC)
                    </td>
                    <td style={{ border: "1px solid #000", padding: "3px 4px" }}>
                      <div className="flex justify-between items-center px-1 font-bold">
                        <span>Rp</span>
                        <span className="font-mono text-right">
                          {totalTarif.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </td>
                    <td style={{ border: "1px solid #000", padding: "3px 4px" }}>
                      <div className="flex justify-between items-center px-1 font-black text-black">
                        <span>Rp</span>
                        <span className="font-mono text-right">
                          {grandTotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* ── RINCIAN REKAPITULASI PAJAK ── */}
          {groupedList.length > 0 && (
            <div className="mt-3 flex justify-between items-start text-[8.5pt]">
              <div className="text-slate-600 italic">
                * Potongan PPh 2% dihitung per pengiriman (Rp {totalPPh2.toLocaleString("id-ID")})
              </div>
              <div className="border border-black p-2 bg-slate-50 w-64 space-y-1">
                <div className="flex justify-between">
                  <span>Total Bruto:</span>
                  <span className="font-mono font-semibold">
                    Rp {totalTarif.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>Potongan PPh 2%:</span>
                  <span className="font-mono font-semibold">
                    - Rp {totalPPh2.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="border-t border-black pt-1 flex justify-between font-bold text-black">
                  <span>Total Tagihan Netto:</span>
                  <span className="font-mono font-black">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── TANDA TANGAN ── */}
          <div className="mt-8 grid grid-cols-2 text-center text-[9pt] gap-10">
            <div>
              <p className="font-semibold text-black">Dibuat Oleh,</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-black">Bagian Operasional / Admin</p>
              <p className="text-[8pt] text-slate-600">{companyInfo.nama}</p>
            </div>
            <div>
              <p className="font-semibold text-black">Diterima & Disetujui Oleh,</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-black">Bagian Penerimaan / Logistik</p>
              <p className="text-[8pt] text-slate-600">{customerInfo.nama}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
