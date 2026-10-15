export function getDeliveryOrderDate(order) {
  const value = order.tanggalKirim;
  if (!value) return null;

  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      return new Date(Date.UTC(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      ));
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getDeliveryOrderFinancials(order) {
  const gross = Number(order.biayaEkspedisi) || 0;
  const profit = Math.round(gross * 0.02);
  const driverExpense =
    order.uangJalanSupir == null ? null : Number(order.uangJalanSupir);

  return { gross, profit, driverExpense };
}
