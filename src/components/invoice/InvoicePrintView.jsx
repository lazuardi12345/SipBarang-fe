import {
  COMPANY_NAME,
  COMPANY_ADDRESS,
  COMPANY_PHONE,
  COMPANY_EMAIL,
} from "../../utils/constants";
import { formatRupiah, formatTanggal } from "../../utils/format";

export function InvoicePrintView({ invoice }) {
  return (
    <div className="mx-auto w-full max-w-3xl bg-white p-10 print:p-0 print:shadow-none" id="invoice-print-area">
      {/* Kop Surat */}
      <div className="flex items-center gap-4 border-b-4 border-brand pb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand text-xl font-bold text-brand">
          AYT
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-900">
            {COMPANY_NAME}
          </h1>
          <p className="text-xs text-slate-500">{COMPANY_ADDRESS}</p>
          <p className="text-xs text-slate-500">
            No. Telepon: {COMPANY_PHONE} &middot; Email: {COMPANY_EMAIL}
          </p>
        </div>
      </div>

      {/* Judul & Info Invoice */}
      <div className="mt-6 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Ditagihkan kepada
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {invoice.namaPelanggan}
          </p>
          {invoice.alamatPelanggan && (
            <p className="max-w-xs text-xs text-slate-500">
              {invoice.alamatPelanggan}
            </p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-brand">INVOICE</h2>
          <p className="text-xs text-slate-500">No: {invoice.noInvoice}</p>
          <p className="text-xs text-slate-500">
            Tanggal: {formatTanggal(invoice.tanggalInvoice)}
          </p>
          <span
            className={
              "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium " +
              (invoice.status === "LUNAS"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700")
            }
          >
            {invoice.status === "LUNAS" ? "Lunas" : "Belum Lunas"}
          </span>
        </div>
      </div>

      {/* Tabel Item */}
      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-slate-800 text-left text-xs uppercase text-slate-500">
            <th className="py-2 pr-2">No. DO</th>
            <th className="py-2 pr-2">Tujuan Kirim</th>
            <th className="py-2 pr-2">Tanggal</th>
            <th className="py-2 pr-2 text-right">Total</th>
            <th className="py-2 pr-2 text-right">PPh 2%</th>
            <th className="py-2 pl-2 text-right">Total - PPh 2%</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.deliveryOrderId} className="border-b border-slate-100">
              <td className="py-2 pr-2">{item.noDO}</td>
              <td className="py-2 pr-2">{item.tujuanKirim}</td>
              <td className="py-2 pr-2">{formatTanggal(item.tanggalKirim)}</td>
              <td className="py-2 pr-2 text-right">
                {formatRupiah(item.biayaEkspedisi)}
              </td>
              <td className="py-2 pr-2 text-right">{formatRupiah(item.pph2)}</td>
              <td className="py-2 pl-2 text-right">
                {formatRupiah(item.totalSetelahPPh)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ringkasan */}
      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatRupiah(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total PPh 2%</span>
            <span>- {formatRupiah(invoice.totalPPh2)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-1 text-base font-bold text-slate-900">
            <span>Total Tagihan</span>
            <span>{formatRupiah(invoice.totalTagihan)}</span>
          </div>
        </div>
      </div>

      {/* Tanda tangan */}
      <div className="mt-16 flex justify-end">
        <div className="text-center text-sm text-slate-600">
          <p>Hormat kami,</p>
          <div className="mt-16 border-t border-slate-400 pt-1">
            {COMPANY_NAME}
          </div>
        </div>
      </div>
    </div>
  );
}
