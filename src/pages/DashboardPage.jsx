"use client";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDeliveryOrders } from "../hooks/useDeliveryOrders";
import { useInvoices } from "../hooks/useInvoices";
import { usePengeluaranLain } from "../hooks/usePengeluaranLain";
import MonthlyFinancialChart from "../components/dashboard/MonthlyFinancialChart";
import { getDirectorCashTotals } from "../utils/deliveryOrderFinance";
import { formatRupiah } from "../utils/format";
import {
  Truck,
  ClipboardCheck,
  PackageCheck,
  Receipt,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { UserRole } from "../utils/constants";

export default function DashboardPage() {
  const { user } = useAuth();
  const isDirektur = user?.role === UserRole.DIREKTUR || user?.role === UserRole.SUPERADMIN;
  const { orders, loading: loadingOrders, updateOwnership } = useDeliveryOrders();
  const { invoices } = useInvoices();
  const {
    items: otherExpenses,
    loading: loadingOtherExpenses,
    error: otherExpensesError,
  } = usePengeluaranLain({}, isDirektur);

  const draftOrders = orders.filter((o) => {
    if (o.status === "DISETUJUI" && (!o.noDocPerusahaan?.trim() || !o.namaSupir?.trim())) return true;
    return o.status === "DRAFT" || o.status === "PLANNING";
  });
  const pendingApproval = orders.filter((o) => o.status === "MENUNGGU_ACC");
  const pendingKonfirmasi = orders.filter((o) => o.status === "MENUNGGU_KONFIRMASI");
  const approvedOrders = orders.filter((o) => o.status === "DISETUJUI" || o.status === "DALAM_PENGIRIMAN");
  const deliveredOrders = orders.filter((o) => o.status === "TERKIRIM");

  const expensesForSummary =
    isDirektur && (loadingOtherExpenses || otherExpensesError) ? null : otherExpenses;
  const totalKeuanganTerkirim = getDirectorCashTotals(
    deliveredOrders,
    isDirektur ? expensesForSummary : []
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-7 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            {isDirektur ? "Portal Direktur Utama" : "Portal Admin Operasional"}
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {user?.nama || "User"} 👋
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            {isDirektur
              ? "PT ALMAIRA YUNIAR TREK — Panel eksekutif untuk persetujuan (ACC) keberangkatan armada dan konfirmasi laporan pengiriman barang selesai."
              : "PT ALMAIRA YUNIAR TREK — Kelola alur pengiriman mulai dari pengajuan SO & uang jalan supir, input surat jalan pabrik, hingga pelaporan barang terkirim."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {isDirektur ? (
              <>
                {(pendingApproval.length > 0 || pendingKonfirmasi.length > 0) && (
                  <Link
                    to="/dashboard/approval"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow transition"
                  >
                    <ClipboardCheck size={16} />
                    {pendingApproval.length + pendingKonfirmasi.length} Pengiriman Butuh ACC Anda
                  </Link>
                )}
                <Link
                  to="/dashboard/riwayat"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow hover:bg-slate-50 transition"
                >
                  <Truck size={16} />
                  Monitoring Pengiriman ({orders.length})
                </Link>
                <Link
                  to="/dashboard/invoice"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow transition"
                >
                  <Receipt size={16} />
                  Lihat Invoice Tagihan
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard/pengiriman"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-800 shadow hover:bg-blue-50 transition"
                >
                  <Truck size={16} />
                  + Input SO
                </Link>
                <Link
                  to="/dashboard/draft-surat-jalan"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow transition"
                >
                  <AlertTriangle size={16} />
                  {draftOrders.length} Butuh SJ Pabrik & Supir
                </Link>
                <Link
                  to="/dashboard/pelaporan"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow transition"
                >
                  <PackageCheck size={16} />
                  Lapor Terkirim ({orders.filter((o) => o.status === "DALAM_PENGIRIMAN").length} Jalan)
                </Link>
                {pendingApproval.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-300/40 px-3 py-2 text-xs font-medium text-amber-200">
                    <Clock size={14} />
                    {pendingApproval.length} Menunggu ACC SO Direktur
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Steps Guide */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Alur Proses Operasional Pengiriman (DO)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="relative rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-white text-[10px]">1</span>
              Input SO & Uang Jalan
            </div>
            <p className="text-xs text-slate-600">
              Input tujuan pengiriman, armada mobil, jadwal SO, dan alokasi uang jalan supir.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white text-[10px]">2</span>
              ACC SO Direktur
            </div>
            <p className="text-xs text-slate-600">
              Direktur memeriksa jadwal SO & menyetujui alokasi uang jalan supir (Gate 1).
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">3</span>
              Input SJ Pabrik & Supir
            </div>
            <p className="text-xs text-slate-600">
              Setelah SO di-ACC, masukkan nomor Surat Jalan Pabrik (Doc) & supir armada untuk jalan.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">4</span>
              Lapor Terkirim & Invoice
            </div>
            <p className="text-xs text-slate-600">
              Barang sampai di toko, upload bukti, ACC selesai terkirim (Gate 2) & cetak tagihan invoice.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isDirektur ? "xl:grid-cols-4" : "lg:grid-cols-4"}`}>
        {isDirektur ? (
          <>
            <Link
              to="/dashboard/approval"
              className="h-full rounded-2xl border border-amber-200 bg-white p-5 shadow-sm hover:border-amber-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-amber-700">Perlu ACC Anda</span>
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700 group-hover:scale-110 transition">
                  <ClipboardCheck size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 leading-none">
                {pendingApproval.length + pendingKonfirmasi.length}
              </p>
              <p className="mt-3 text-xs text-amber-600 font-semibold flex items-center gap-1">
                Buka menu ACC Direktur <ArrowRight size={12} />
              </p>
            </Link>

            <Link
              to="/dashboard/riwayat"
              className="h-full rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:border-blue-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-blue-700">Dalam Pengiriman</span>
                <div className="rounded-xl bg-blue-100 p-2 text-blue-700 group-hover:scale-110 transition">
                  <Truck size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 leading-none">{approvedOrders.length}</p>
              <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                Sedang dalam perjalanan <ArrowRight size={12} />
              </p>
            </Link>

            <Link
              to="/dashboard/riwayat"
              className="h-full rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm hover:border-emerald-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-emerald-700">Sudah Terkirim</span>
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 group-hover:scale-110 transition">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 leading-none">{deliveredOrders.length}</p>
              <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                Pengiriman sukses <ArrowRight size={12} />
              </p>
            </Link>

            <Link
              to="/dashboard/invoice"
              className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-slate-700">Bruto Total</span>
                <div className="rounded-xl bg-slate-100 p-2 text-slate-700 group-hover:scale-110 transition">
                  <Receipt size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">{formatRupiah(totalKeuanganTerkirim.gross)}</p>
              <p className="mt-3 text-xs text-slate-500">
                Nilai tagihan pengiriman selesai
              </p>
            </Link>

            <Link
              to="/dashboard/invoice"
              className="h-full rounded-2xl border border-orange-200 bg-white p-5 shadow-sm hover:border-orange-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-orange-700">PPh Invoice (2%)</span>
                <div className="rounded-xl bg-orange-100 p-2 text-orange-700 group-hover:scale-110 transition">
                  <Receipt size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">{formatRupiah(totalKeuanganTerkirim.pph2)}</p>
              <p className="mt-3 text-xs text-slate-500">
                Dipotong pada invoice
              </p>
            </Link>

            <Link
              to="/dashboard/invoice"
              className="h-full rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm hover:border-emerald-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-emerald-700">Kas Perusahaan dari Tarif</span>
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 group-hover:scale-110 transition">
                  <TrendingUp size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {totalKeuanganTerkirim.companyRevenue == null
                  ? "Data belum lengkap"
                  : formatRupiah(totalKeuanganTerkirim.companyRevenue)}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Pribadi 98% · Vendor 8%
              </p>
            </Link>

            <Link
              to="/dashboard/invoice"
              className="h-full rounded-2xl border border-violet-200 bg-white p-5 shadow-sm hover:border-violet-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-violet-700">Pembayaran Vendor</span>
                <div className="rounded-xl bg-violet-100 p-2 text-violet-700 group-hover:scale-110 transition">
                  <TrendingDown size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {totalKeuanganTerkirim.vendorPayment == null
                  ? "Data belum lengkap"
                  : formatRupiah(totalKeuanganTerkirim.vendorPayment)}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                90% dari bruto SO Vendor
              </p>
            </Link>

            <Link
              to="/dashboard/riwayat"
              className="h-full rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:border-blue-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-blue-700">Potongan Uang Jalan</span>
                <div className="rounded-xl bg-blue-100 p-2 text-blue-700 group-hover:scale-110 transition">
                  <TrendingDown size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {totalKeuanganTerkirim.driverExpense == null
                  ? "Data belum lengkap"
                  : formatRupiah(totalKeuanganTerkirim.driverExpense)}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Dikurangi per SO
              </p>
            </Link>

            <Link
              to="/dashboard/pengeluaran-lain"
              className="h-full rounded-2xl border border-rose-200 bg-white p-5 shadow-sm hover:border-rose-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-rose-700">Pengeluaran Lain</span>
                <div className="rounded-xl bg-rose-100 p-2 text-rose-700 group-hover:scale-110 transition">
                  <TrendingDown size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {loadingOtherExpenses
                  ? "Memuat..."
                  : otherExpensesError
                  ? "Gagal dimuat"
                  : formatRupiah(totalKeuanganTerkirim.otherExpenses || 0)}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Dikurangi dari uang kas
              </p>
            </Link>

            <div className="h-full rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-amber-800">Saldo Kas Bersih</span>
                <div className="rounded-xl bg-amber-100 p-2 text-amber-800">
                  <Wallet size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {totalKeuanganTerkirim.cashBalance == null
                  ? loadingOtherExpenses
                    ? "Memuat..."
                    : otherExpensesError
                    ? "Gagal dimuat"
                    : "Data belum lengkap"
                  : formatRupiah(totalKeuanganTerkirim.cashBalance)}
              </p>
              <p className="mt-3 text-xs text-slate-600">
                Setelah uang jalan & pengeluaran lain
              </p>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/dashboard/draft-surat-jalan"
              className="h-full rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:border-blue-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-blue-700">ACC</span>
                <div className="rounded-xl bg-blue-100 p-2 text-blue-700 group-hover:scale-110 transition">
                  <Truck size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 leading-none">{approvedOrders.length}</p>
              <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                {draftOrders.length > 0 ? `${draftOrders.length} butuh surat jalan & supir` : "Armada dalam perjalanan"} <ArrowRight size={12} />
              </p>
            </Link>

            <Link
              to="/dashboard/riwayat"
              className="h-full rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm hover:border-emerald-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-emerald-700">Terkirim</span>
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 group-hover:scale-110 transition">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 leading-none">{deliveredOrders.length}</p>
              <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                Pengiriman sukses <ArrowRight size={12} />
              </p>
            </Link>

            <Link
              to="/dashboard/pengiriman"
              className="h-full rounded-2xl border border-amber-200 bg-white p-5 shadow-sm hover:border-amber-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-amber-700">Menunggu ACC</span>
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700 group-hover:scale-110 transition">
                  <Clock size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 leading-none">{pendingApproval.length + pendingKonfirmasi.length}</p>
              <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                {pendingKonfirmasi.length > 0
                  ? `${pendingApproval.length} keberangkatan · ${pendingKonfirmasi.length} terkirim`
                  : "Telah diajukan ke Direktur"}{" "}
                <ArrowRight size={12} />
              </p>
            </Link>

            <Link
              to="/dashboard/riwayat"
              className="h-full rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm hover:border-indigo-400 transition group flex flex-col"
            >
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-semibold uppercase text-indigo-700">Uang Jalan Supir</span>
                <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 group-hover:scale-110 transition">
                  <TrendingUp size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {totalKeuanganTerkirim.driverExpense == null
                  ? "Belum lengkap"
                  : formatRupiah(totalKeuanganTerkirim.driverExpense)}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Total uang jalan pengiriman terkirim
              </p>
            </Link>
          </>
        )}
      </div>

      {isDirektur && otherExpensesError && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          Pengeluaran lain-lain gagal dimuat, jadi saldo kas bersih belum dapat dihitung. {otherExpensesError}
        </p>
      )}

      {isDirektur && (totalKeuanganTerkirim.missingOwnershipCount > 0 || totalKeuanganTerkirim.missingDriverExpenseCount > 0) && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          Saldo kas belum lengkap:
          {totalKeuanganTerkirim.missingOwnershipCount > 0 && ` ${totalKeuanganTerkirim.missingOwnershipCount} SO belum punya status Pribadi/Vendor yang valid`}
          {totalKeuanganTerkirim.mixedOwnershipCount > 0 && `, termasuk ${totalKeuanganTerkirim.mixedOwnershipCount} SO dengan DOC campuran`}
          {totalKeuanganTerkirim.missingDriverExpenseCount > 0 && `; ${totalKeuanganTerkirim.missingDriverExpenseCount} SO belum memiliki data uang jalan`}
          .
        </p>
      )}

      {!isDirektur && totalKeuanganTerkirim.missingDriverExpenseCount > 0 && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          {totalKeuanganTerkirim.missingDriverExpenseCount} DO terkirim belum memiliki data uang jalan supir.
        </p>
      )}

      {isDirektur && loadingOtherExpenses && (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
          Memuat data pengeluaran lain-lain untuk perhitungan kas...
        </p>
      )}
      {isDirektur && !loadingOtherExpenses && !otherExpensesError && (
        <MonthlyFinancialChart
          orders={orders}
          otherExpenses={otherExpenses}
          canEditOwnership={user?.role === UserRole.DIREKTUR}
          onUpdateOwnership={updateOwnership}
        />
      )}

      {/* Recent Orders List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Pengiriman Terakhir</h2>
            <p className="text-xs text-slate-500">Update status surat jalan terkini</p>
          </div>
          <Link
            to="/dashboard/riwayat"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Lihat Semua <ArrowRight size={13} />
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-8 text-center text-sm text-slate-500">Memuat data pengiriman...</div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Belum ada data pengiriman. Silakan mulai dengan tombol <strong>+ Input Pengiriman Baru</strong>.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100/70 transition"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-slate-900">{order.noSchedule || "-"}</p>
                  <p className="text-xs text-slate-700">
                    {order.namaToko || order.namaPenerima} — {order.tujuanKirim}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supir: {order.namaSupir} ({order.noPolisiKendaraan})
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs text-emerald-700">{formatRupiah(order.totalSetelahPPh)}</p>
                  <span className="inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
