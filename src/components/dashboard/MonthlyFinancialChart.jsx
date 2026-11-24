import { useMemo, useState } from "react";
import {
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatRupiah, formatTanggal } from "../../utils/format";
import {
  getDirectorCashTotals,
  getDeliveryOrderDate,
  getDeliveryOrderFinancials,
  getOtherExpenseDate,
  getVehicleOwnershipLabel,
} from "../../utils/deliveryOrderFinance";
import {
  getFinancialDateKey,
  getFinancialDateRange,
  isDateWithinFinancialRange,
} from "../../utils/financialDateFilter";

const fullMonthLabels = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat("id-ID", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2026, month, 1))
  )
);
const dayMilliseconds = 24 * 60 * 60 * 1000;

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPeriodDate(date, options) {
  return new Intl.DateTimeFormat("id-ID", {
    ...options,
    timeZone: "UTC",
  }).format(date);
}

function createChartPeriods(range) {
  if (!range.valid) return [];

  const periods = [];
  if (range.granularity === "month") {
    let cursor = new Date(Date.UTC(
      range.start.getUTCFullYear(),
      range.start.getUTCMonth(),
      1
    ));
    while (cursor < range.endExclusive) {
      periods.push({
        key: getFinancialDateKey(cursor, "month"),
        label: formatPeriodDate(cursor, { month: "short", year: "numeric" }),
        title: formatPeriodDate(cursor, { month: "long", year: "numeric" }),
      });
      cursor = new Date(Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth() + 1,
        1
      ));
    }
    return periods;
  }

  for (
    let cursor = new Date(range.start);
    cursor < range.endExclusive;
    cursor = new Date(cursor.getTime() + dayMilliseconds)
  ) {
    periods.push({
      key: getFinancialDateKey(cursor, "day"),
      label: formatPeriodDate(cursor, { day: "numeric", month: "short" }),
      title: formatPeriodDate(cursor, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });
  }
  return periods;
}

export default function MonthlyFinancialChart({
  orders,
  otherExpenses,
  canEditOwnership = false,
  onUpdateOwnership,
}) {
  const [filterMode, setFilterMode] = useState("YEAR");
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(() => toDateInputValue(new Date()));
  const [customFrom, setCustomFrom] = useState(
    () => `${new Date().getFullYear()}-01-01`
  );
  const [customTo, setCustomTo] = useState(() => toDateInputValue(new Date()));
  const [ownershipEdit, setOwnershipEdit] = useState(null);
  const [savingOwnershipId, setSavingOwnershipId] = useState(null);
  const [ownershipError, setOwnershipError] = useState(null);
  const [ownershipNotice, setOwnershipNotice] = useState("");

  const saveOwnership = async (orderId) => {
    if (!ownershipEdit || ownershipEdit.orderId !== orderId || !ownershipEdit.jenisKendaraan) {
      return;
    }

    setSavingOwnershipId(orderId);
    setOwnershipError(null);
    setOwnershipNotice("");
    try {
      await onUpdateOwnership(orderId, ownershipEdit.jenisKendaraan);
      setOwnershipEdit(null);
      setOwnershipNotice("Kepemilikan kendaraan berhasil dilengkapi.");
    } catch (error) {
      setOwnershipError({
        orderId,
        message: error instanceof Error ? error.message : "Gagal melengkapi kepemilikan kendaraan.",
      });
    } finally {
      setSavingOwnershipId(null);
    }
  };

  const availableYears = useMemo(() => {
    const years = new Set([new Date().getFullYear()]);
    orders.forEach((order) => {
      if (order.status !== "TERKIRIM") return;
      const date = getDeliveryOrderDate(order);
      if (date) years.add(date.getUTCFullYear());
    });
    otherExpenses.forEach((expense) => {
      const date = getOtherExpenseDate(expense);
      if (date) years.add(date.getUTCFullYear());
    });
    return [...years].sort((a, b) => b - a);
  }, [orders, otherExpenses]);

  const dateRange = useMemo(
    () => getFinancialDateRange({
      mode: filterMode,
      year: selectedYear,
      month: selectedMonth,
      date: selectedDay,
      from: customFrom,
      to: customTo,
    }),
    [filterMode, selectedYear, selectedMonth, selectedDay, customFrom, customTo]
  );

  const deliveredOrders = useMemo(
    () =>
      orders
        .filter((order) => {
          if (order.status !== "TERKIRIM") return false;
          const date = getDeliveryOrderDate(order);
          return isDateWithinFinancialRange(date, dateRange);
        })
        .sort((a, b) => {
          const dateA = getDeliveryOrderDate(a);
          const dateB = getDeliveryOrderDate(b);
          return dateB.getTime() - dateA.getTime();
        }),
    [orders, dateRange]
  );
  const expensesForRange = useMemo(
    () =>
      otherExpenses.filter((expense) => {
        const date = getOtherExpenseDate(expense);
        return isDateWithinFinancialRange(date, dateRange);
      }),
    [otherExpenses, dateRange]
  );
  const totals = getDirectorCashTotals(deliveredOrders, expensesForRange);

  const chartPeriods = useMemo(
    () => createChartPeriods(dateRange),
    [dateRange]
  );
  const periodTotals = useMemo(() => {
    const periods = chartPeriods.map((period) => ({
      ...period,
      gross: 0,
      companyRevenue: 0,
      vendorPayment: 0,
      driverExpense: 0,
      otherExpenses: 0,
    }));
    const periodByKey = new Map(periods.map((period) => [period.key, period]));

    deliveredOrders.forEach((order) => {
      const date = getDeliveryOrderDate(order);
      if (!date) return;
      const amounts = getDeliveryOrderFinancials(order);
      const period = periodByKey.get(getFinancialDateKey(date, dateRange.granularity));
      if (!period) return;
      period.gross += amounts.gross;
      if (amounts.companyRevenue != null) {
        period.companyRevenue += amounts.companyRevenue;
        period.vendorPayment += amounts.vendorPayment;
      }
      if (amounts.driverExpense != null) period.driverExpense += amounts.driverExpense;
    });

    expensesForRange.forEach((expense) => {
      const date = getOtherExpenseDate(expense);
      if (!date) return;
      const period = periodByKey.get(getFinancialDateKey(date, dateRange.granularity));
      if (period) period.otherExpenses += Number(expense.nominal) || 0;
    });
    return periods;
  }, [chartPeriods, deliveredOrders, expensesForRange, dateRange.granularity]);
  const maxAmount = Math.max(
    ...periodTotals.flatMap((period) => [
      period.gross,
      period.companyRevenue,
      period.vendorPayment,
      period.driverExpense,
      period.otherExpenses,
    ]),
    1
  );
  const summaryCards = [
    { label: "Bruto", amount: totals.gross, Icon: CalendarDays, style: "border-slate-200 bg-slate-50 text-slate-700" },
    { label: "PPh Invoice (2%)", amount: totals.pph2, Icon: TrendingDown, style: "border-orange-100 bg-orange-50 text-orange-700" },
    { label: "Kas Perusahaan dari Tarif", amount: totals.companyRevenue, Icon: TrendingUp, style: "border-emerald-100 bg-emerald-50 text-emerald-700" },
    { label: "Pembayaran Vendor", amount: totals.vendorPayment, Icon: TrendingDown, style: "border-violet-100 bg-violet-50 text-violet-700" },
    { label: "Uang Jalan", amount: totals.driverExpense, Icon: TrendingDown, style: "border-blue-100 bg-blue-50 text-blue-700" },
    { label: "Pengeluaran Lain", amount: totals.otherExpenses, Icon: TrendingDown, style: "border-rose-100 bg-rose-50 text-rose-700" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <CalendarDays size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Ringkasan Kas</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Pribadi menyumbang 98% bruto ke kas; Vendor menyumbang 8% dan dibayar 90%. PPh 2% mengikuti invoice.
            {" "}Periode: {dateRange.label}.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Periode
            <select
              value={filterMode}
              onChange={(event) => setFilterMode(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="DAY">Hari</option>
              <option value="MONTH">Bulan</option>
              <option value="YEAR">Tahun</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </label>
          {(filterMode === "YEAR" || filterMode === "MONTH") && (
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
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
          )}
          {filterMode === "MONTH" && (
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Bulan
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(Number(event.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {fullMonthLabels.map((label, month) => (
                  <option key={month} value={month}>{label}</option>
                ))}
              </select>
            </label>
          )}
          {filterMode === "DAY" && (
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Tanggal
              <input
                type="date"
                value={selectedDay}
                onChange={(event) => setSelectedDay(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>
          )}
          {filterMode === "CUSTOM" && (
            <>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Dari tanggal
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Sampai tanggal
                <input
                  type="date"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {!dateRange.valid ? (
        <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Pilih tanggal atau rentang tanggal yang valid untuk melihat ringkasan.
        </p>
      ) : (
      <>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, amount, Icon, style }) => (
          <div key={label} className={`rounded-xl border p-4 ${style}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <Icon size={16} />
              {label}
            </div>
            <p className="mt-2 text-xl font-black text-slate-900">
              {amount == null ? "Belum lengkap" : formatRupiah(amount)}
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <Wallet size={16} />
            Arus Kas Bersih
          </div>
          <p className="mt-2 text-xl font-black text-slate-900">
            {totals.cashBalance == null ? "Data belum lengkap" : formatRupiah(totals.cashBalance)}
          </p>
          <p className="mt-1 text-[11px] text-slate-600">Sesudah uang jalan & pengeluaran lain</p>
        </div>
      </div>
      {(totals.missingOwnershipCount > 0 || totals.missingDriverExpenseCount > 0) && (
        <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          Saldo belum dapat dipastikan:
          {totals.missingOwnershipCount > 0 && ` ${totals.missingOwnershipCount} SO belum punya status Pribadi/Vendor yang valid`}
          {totals.mixedOwnershipCount > 0 && `, termasuk ${totals.mixedOwnershipCount} SO dengan DOC campuran`}
          {totals.missingDriverExpenseCount > 0 && `; ${totals.missingDriverExpenseCount} SO belum memiliki data uang jalan`}.
        </p>
      )}

      <div className="mt-6 overflow-x-auto">
        <div
          className="grid h-48 gap-2 sm:h-56 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${periodTotals.length}, minmax(44px, 1fr))`,
            minWidth: `${Math.max(720, periodTotals.length * 54)}px`,
          }}
          role="img"
          aria-label={`Grafik bruto, kas perusahaan, pembayaran vendor, uang jalan, dan pengeluaran lain ${dateRange.label}`}
        >
        {periodTotals.map((period) => {
          const grossHeight = (period.gross / maxAmount) * 100;
          const companyHeight = (period.companyRevenue / maxAmount) * 100;
          const vendorHeight = (period.vendorPayment / maxAmount) * 100;
          const driverHeight = (period.driverExpense / maxAmount) * 100;
          const otherExpenseHeight = (period.otherExpenses / maxAmount) * 100;
          return (
            <div key={period.key} className="flex min-w-0 flex-col items-center justify-end">
              <div className="flex h-full w-full items-end justify-center gap-0.5 border-b border-slate-200">
                <div
                  title={`${period.title} - Bruto: ${formatRupiah(period.gross)}`}
                  className="w-1/5 max-w-5 rounded-t bg-slate-500 transition-[height]"
                  style={{ height: `${grossHeight}%` }}
                />
                <div
                  title={`${period.title} - Kas perusahaan dari tarif: ${formatRupiah(period.companyRevenue)}`}
                  className="w-1/5 max-w-5 rounded-t bg-emerald-500 transition-[height]"
                  style={{ height: `${companyHeight}%` }}
                />
                <div
                  title={`${period.title} - Pembayaran vendor: ${formatRupiah(period.vendorPayment)}`}
                  className="w-1/5 max-w-5 rounded-t bg-violet-500 transition-[height]"
                  style={{ height: `${vendorHeight}%` }}
                />
                <div
                  title={`${period.title} - Uang jalan: ${formatRupiah(period.driverExpense)}`}
                  className="w-1/5 max-w-5 rounded-t bg-blue-500 transition-[height]"
                  style={{ height: `${driverHeight}%` }}
                />
                <div
                  title={`${period.title} - Pengeluaran lain: ${formatRupiah(period.otherExpenses)}`}
                  className="w-1/5 max-w-5 rounded-t bg-rose-500 transition-[height]"
                  style={{ height: `${otherExpenseHeight}%` }}
                />
              </div>
              <span className="mt-2 text-[10px] font-medium text-slate-500 sm:text-xs">
                {period.label}
              </span>
            </div>
          );
        })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-500" />
          Bruto
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
          Uang jalan per SO
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
          Pembayaran Vendor
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
          Pengeluaran Lain
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Kas Perusahaan dari Tarif
        </span>
      </div>

      <div className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rincian Kas per SO</h3>
            <p className="mt-1 text-xs text-slate-500">
              Kas bersih per SO adalah bagian perusahaan setelah PPh dan uang jalan, sebelum pengeluaran lain.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {deliveredOrders.length} DO
          </span>
        </div>
        {ownershipNotice && (
          <p role="status" className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {ownershipNotice}
          </p>
        )}
        {deliveredOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Belum ada DO terkirim pada {dateRange.label}.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-[1450px] w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tanggal kirim</th>
                  <th className="px-4 py-3 font-semibold">No. Schedule</th>
                  <th className="px-4 py-3 font-semibold">Kepemilikan</th>
                  <th className="px-4 py-3 font-semibold">Tujuan</th>
                  <th className="px-4 py-3 text-right font-semibold">Tarif Bruto</th>
                  <th className="px-4 py-3 text-right font-semibold">PPh Invoice</th>
                  <th className="px-4 py-3 text-right font-semibold">Kas Perusahaan</th>
                  <th className="px-4 py-3 text-right font-semibold">Bayar Vendor</th>
                  <th className="px-4 py-3 text-right font-semibold">Uang Jalan</th>
                  <th className="px-4 py-3 text-right font-semibold">Kas SO</th>
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
                        {order.noSchedule || "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        <div className="space-y-2">
                          <span>
                            {amounts.ownership === "MIXED"
                              ? "DOC campuran"
                              : getVehicleOwnershipLabel(amounts.ownership)}
                          </span>
                          {canEditOwnership &&
                            (amounts.ownership == null || amounts.ownership === "MIXED") &&
                            (ownershipEdit?.orderId === order.id ? (
                              <div className="space-y-2">
                                <select
                                  aria-label={`Pilih kepemilikan untuk SO ${order.noSchedule || order.id}`}
                                  value={ownershipEdit.jenisKendaraan}
                                  onChange={(event) => {
                                    setOwnershipEdit({
                                      ...ownershipEdit,
                                      jenisKendaraan: event.target.value,
                                    });
                                    setOwnershipError(null);
                                  }}
                                  disabled={savingOwnershipId === order.id}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-800"
                                >
                                  <option value="">Pilih Pribadi/Vendor</option>
                                  <option value="PRIBADI">Pribadi</option>
                                  <option value="VENDOR">Vendor</option>
                                </select>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveOwnership(order.id)}
                                    disabled={!ownershipEdit.jenisKendaraan || savingOwnershipId === order.id}
                                    className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {savingOwnershipId === order.id ? "Menyimpan..." : "Simpan"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOwnershipEdit(null);
                                      setOwnershipError(null);
                                    }}
                                    disabled={savingOwnershipId === order.id}
                                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 disabled:opacity-50"
                                  >
                                    Batal
                                  </button>
                                </div>
                                {ownershipError?.orderId === order.id && (
                                  <p role="alert" className="max-w-40 font-normal text-rose-700">
                                    {ownershipError.message}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setOwnershipEdit({ orderId: order.id, jenisKendaraan: "" });
                                  setOwnershipError(null);
                                  setOwnershipNotice("");
                                }}
                                disabled={savingOwnershipId !== null}
                                className="block rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {amounts.ownership === "MIXED" ? "Perbaiki" : "Isi status"}
                              </button>
                            ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {order.tujuanKirim || order.areaDistribusi || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-700">
                        {formatRupiah(amounts.gross)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-orange-700">
                        {formatRupiah(amounts.pph2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-700">
                        {amounts.companyRevenue == null ? "Periksa status" : formatRupiah(amounts.companyRevenue)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-violet-700">
                        {amounts.vendorPayment == null ? "Periksa status" : formatRupiah(amounts.vendorPayment)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-blue-700">
                        {amounts.driverExpense == null ? "Belum diisi" : formatRupiah(amounts.driverExpense)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">
                        {amounts.cashBeforeOtherExpenses == null
                          ? "Belum lengkap"
                          : formatRupiah(amounts.cashBeforeOtherExpenses)}
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
                    {formatRupiah(totals.gross)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-orange-700">
                    {formatRupiah(totals.pph2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-emerald-700">
                    {totals.companyRevenue == null
                      ? "Data belum lengkap"
                      : formatRupiah(totals.companyRevenue)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-violet-700">
                    {totals.vendorPayment == null
                      ? "Data belum lengkap"
                      : formatRupiah(totals.vendorPayment)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-blue-700">
                    {totals.missingDriverExpenseCount > 0
                      ? "Data belum lengkap"
                      : formatRupiah(totals.driverExpense)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">
                    {totals.cashBalance == null
                      ? "Data belum lengkap"
                      : formatRupiah(totals.cashBeforeOtherExpenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {deliveredOrders.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-end gap-x-8 gap-y-2 rounded-xl bg-amber-50 px-4 py-3 text-xs">
            <span className="text-slate-600">
              Pengeluaran lain {dateRange.label}:{" "}
              <strong className="text-rose-700">{formatRupiah(totals.otherExpenses || 0)}</strong>
            </span>
            <span className="text-slate-700">
              Arus kas bersih:{" "}
              <strong className="text-amber-900">
                {totals.cashBalance == null ? "Data belum lengkap" : formatRupiah(totals.cashBalance)}
              </strong>
            </span>
          </div>
        )}
      </div>
      </>
      )}
    </section>
  );
}
