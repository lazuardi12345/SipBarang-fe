import { useMemo, useState } from "react";
import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import { formatRupiah, formatTanggal } from "../../utils/format";
import {
  getDeliveryOrderDate,
  getDeliveryOrderFinancials,
} from "../../utils/deliveryOrderFinance";

const monthLabels = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(2026, month, 1))
  )
);

export default function MonthlyFinancialChart({ orders }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const availableYears = useMemo(() => {
    const years = new Set([new Date().getFullYear()]);
    orders.forEach((order) => {
      if (order.status !== "TERKIRIM") return;
      const date = getDeliveryOrderDate(order);
      if (date) years.add(date.getUTCFullYear());
    });
    return [...years].sort((a, b) => b - a);
  }, [orders]);

  const monthlyTotals = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => ({
      gross: 0,
      driverExpense: 0,
      profit: 0,
      completeCount: 0,
      missingCount: 0,
    }));
    orders.forEach((order) => {
      if (order.status !== "TERKIRIM") return;
      const date = getDeliveryOrderDate(order);
      if (!date || date.getUTCFullYear() !== selectedYear) return;

      const amounts = getDeliveryOrderFinancials(order);
      const month = date.getUTCMonth();
      totals[month].gross += amounts.gross;
      totals[month].profit += amounts.profit;
      if (amounts.driverExpense == null) {
        totals[month].missingCount += 1;
        return;
      }
      totals[month].driverExpense += amounts.driverExpense;
      totals[month].completeCount += 1;
    });
    return totals;
  }, [orders, selectedYear]);

  const totals = monthlyTotals.reduce(
    (sum, month) => ({
      gross: sum.gross + month.gross,
      driverExpense: sum.driverExpense + month.driverExpense,
      profit: sum.profit + month.profit,
      completeCount: sum.completeCount + month.completeCount,
      missingCount: sum.missingCount + month.missingCount,
    }),
    { gross: 0, driverExpense: 0, profit: 0, completeCount: 0, missingCount: 0 }
  );
  const deliveredOrders = useMemo(
    () =>
      orders
        .filter((order) => {
          if (order.status !== "TERKIRIM") return false;
          const date = getDeliveryOrderDate(order);
          return date?.getUTCFullYear() === selectedYear;
        })
        .sort((a, b) => {
          const dateA = getDeliveryOrderDate(a);
          const dateB = getDeliveryOrderDate(b);
          return dateB.getTime() - dateA.getTime();
        }),
    [orders, selectedYear]
  );
  const detailTotals = deliveredOrders.reduce(
    (sum, order) => {
      const amounts = getDeliveryOrderFinancials(order);
      const gross = sum.gross + amounts.gross;
      const profit = sum.profit + amounts.profit;
      if (amounts.driverExpense == null) {
        return { ...sum, gross, profit, missingCount: sum.missingCount + 1 };
      }
      return {
        gross,
        driverExpense: sum.driverExpense + amounts.driverExpense,
        profit,
        completeCount: sum.completeCount + 1,
        missingCount: sum.missingCount,
      };
    },
    { gross: 0, driverExpense: 0, profit: 0, completeCount: 0, missingCount: 0 }
  );
  const maxAmount = Math.max(...monthlyTotals.map((month) => month.gross), 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <CalendarDays size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Ringkasan Keuangan Bulanan</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Laba = 2% dari tarif bruto. Uang jalan sopir dihitung terpisah sesuai nilai master tujuan.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          Tahun
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
            <CalendarDays size={16} />
            Bruto
          </div>
          <p className="mt-2 text-xl font-black text-slate-900">{formatRupiah(totals.gross)}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <TrendingDown size={16} />
            Pengeluaran Sopir
          </div>
          <p className="mt-2 text-xl font-black text-slate-900">{formatRupiah(totals.driverExpense)}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            <TrendingUp size={16} />
            Laba
          </div>
          <p className="mt-2 text-xl font-black text-slate-900">{formatRupiah(totals.profit)}</p>
        </div>
      </div>
      {totals.missingCount > 0 && (
        <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          {totals.missingCount} DO terkirim belum memiliki data uang jalan dari master tarif, jadi laba/pengeluaran DO tersebut tidak ikut dijumlahkan. Jalankan migrasi backend untuk mengisi snapshot uang jalan dari master tarif.
        </p>
      )}

      <div className="mt-6 grid h-48 grid-cols-6 gap-2 sm:h-56 sm:grid-cols-12 sm:gap-3" role="img" aria-label={`Grafik bruto, uang jalan sopir, dan laba per bulan tahun ${selectedYear}`}>
        {monthlyTotals.map((month, index) => {
          const grossHeight = (month.gross / maxAmount) * 100;
          const expenseHeight = (month.driverExpense / maxAmount) * 100;
          const profitHeight = (month.profit / maxAmount) * 100;
          return (
            <div key={index} className="flex min-w-0 flex-col items-center justify-end">
              <div className="flex h-full w-full items-end justify-center gap-0.5 border-b border-slate-200">
                <div
                  title={`${monthLabels[index]} - Bruto: ${formatRupiah(month.gross)}`}
                  className="w-1/4 max-w-5 rounded-t bg-slate-500 transition-[height]"
                  style={{ height: `${grossHeight}%` }}
                />
                <div
                  title={`${monthLabels[index]} - Pengeluaran sopir: ${formatRupiah(month.driverExpense)}`}
                  className="w-1/4 max-w-5 rounded-t bg-blue-500 transition-[height]"
                  style={{ height: `${expenseHeight}%` }}
                />
                <div
                  title={`${monthLabels[index]} - Laba 2%: ${formatRupiah(month.profit)}`}
                  className="w-1/4 max-w-5 rounded-t bg-emerald-500 transition-[height]"
                  style={{ height: `${profitHeight}%` }}
                />
              </div>
              <span className="mt-2 text-[10px] font-medium text-slate-500 sm:text-xs">
                {monthLabels[index]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-500" />
          Bruto
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
          Uang jalan sopir (master tarif)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Laba (2% dari bruto)
        </span>
      </div>

      <div className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rincian Pengeluaran Sopir</h3>
            <p className="mt-1 text-xs text-slate-500">
              Laba = 2% tarif bruto. Uang jalan ditampilkan terpisah sesuai master tujuan.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {deliveredOrders.length} DO
          </span>
        </div>
        {deliveredOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Belum ada DO terkirim pada tahun {selectedYear}.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-[900px] w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tanggal DO</th>
                  <th className="px-4 py-3 font-semibold">No. DO</th>
                  <th className="px-4 py-3 font-semibold">Sopir / Kendaraan</th>
                  <th className="px-4 py-3 font-semibold">Tujuan</th>
                  <th className="px-4 py-3 text-right font-semibold">Tarif Bruto</th>
                  <th className="px-4 py-3 text-right font-semibold">Pengeluaran Sopir</th>
                  <th className="px-4 py-3 text-right font-semibold">Laba (2%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {deliveredOrders.map((order) => {
                  const amounts = getDeliveryOrderFinancials(order);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatTanggal(order.tanggalKirim)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-slate-800">
                        {order.noDO}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium">{order.namaSupir || "—"}</div>
                        <div className="mt-0.5 text-[11px] text-slate-400">{order.noPolisiKendaraan || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {order.tujuanKirim || order.areaDistribusi || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-700">
                        {formatRupiah(amounts.gross)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-blue-700">
                        {amounts.driverExpense == null ? "Belum ada data tarif" : formatRupiah(amounts.driverExpense)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-700">
                        {amounts.profit == null ? "—" : formatRupiah(amounts.profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <th colSpan={4} className="px-4 py-3 text-left text-xs font-bold text-slate-800">
                    TOTAL ({deliveredOrders.length} DO)
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-800">
                    {formatRupiah(detailTotals.gross)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-blue-700">
                    {detailTotals.missingCount > 0 ? "Data belum lengkap" : formatRupiah(detailTotals.driverExpense)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-emerald-700">
                    {formatRupiah(detailTotals.profit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
