import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BadgeCheck, FileCheck2, ShieldAlert } from "lucide-react";
import { invoiceApi } from "../api/invoices";
import { COMPANY_NAME } from "../utils/constants";
import { formatRupiah, formatTanggal } from "../utils/format";

export default function InvoiceVerificationPage() {
  const { token } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    invoiceApi.verify(token)
      .then((result) => {
        if (active) setVerification(result);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Verifikasi invoice gagal.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const verified = verification?.verified === true;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <header className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
          <img src="/assets/logo.jpg" alt="Logo PT Almira Yuniar Trek" className="h-14 w-14 object-contain" />
          <div>
            <p className="text-sm font-black tracking-wide text-slate-900">{COMPANY_NAME}</p>
            <p className="mt-1 text-xs text-slate-500">Pengesahan dokumen invoice</p>
          </div>
        </header>

        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Memeriksa keaslian invoice...</div>
          ) : error ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
              <ShieldAlert className="mx-auto text-red-600" size={34} />
              <h1 className="mt-3 text-lg font-bold text-red-800">Invoice tidak dapat diverifikasi</h1>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          ) : (
            <>
              <div className={`rounded-xl border p-5 text-center ${verified ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                {verified ? (
                  <BadgeCheck className="mx-auto text-emerald-600" size={40} />
                ) : (
                  <ShieldAlert className="mx-auto text-amber-600" size={40} />
                )}
                <h1 className={`mt-2 text-lg font-black ${verified ? "text-emerald-900" : "text-amber-900"}`}>
                  {verified ? "Invoice Terverifikasi" : "Penerbit Perlu Diverifikasi"}
                </h1>
                <p className={`mt-1 text-sm ${verified ? "text-emerald-800" : "text-amber-800"}`}>
                  {verified
                    ? "Invoice ini terdaftar dan diterbitkan oleh akun Direktur."
                    : "Invoice terdaftar, tetapi catatan penerbitnya bukan akun Direktur."}
                </p>
              </div>

              <dl className="mt-6 divide-y divide-slate-100 text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-slate-500">Nomor Invoice</dt>
                  <dd className="text-right font-bold text-slate-900">{verification.noInvoice}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-slate-500">Pelanggan</dt>
                  <dd className="text-right font-semibold text-slate-900">{verification.namaPelanggan}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-slate-500">Tanggal Terbit</dt>
                  <dd className="text-right font-semibold text-slate-900">{formatTanggal(verification.tanggalInvoice)}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-slate-500">Total Tagihan</dt>
                  <dd className="text-right font-bold text-slate-900">{formatRupiah(verification.totalTagihan)}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-slate-500">Pengesah</dt>
                  <dd className="text-right font-semibold text-slate-900">{verification.namaPengesah || "Tidak tersedia"}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="text-right font-bold text-slate-900">{verification.status}</dd>
                </div>
              </dl>
              <p className="mt-5 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                <FileCheck2 size={16} className="mt-0.5 shrink-0 text-blue-700" />
                Hasil ini diperiksa langsung dari catatan invoice resmi PT Almira Yuniar Trek.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
