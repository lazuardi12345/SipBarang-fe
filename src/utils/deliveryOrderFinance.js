function parseDate(value) {
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

export function getDeliveryOrderDate(order) {
  return parseDate(order.tanggalKirim);
}

export function getOtherExpenseDate(expense) {
  return parseDate(expense.tanggal);
}

export function normalizeVehicleOwnership(value) {
  const ownership = String(value || "").trim().toUpperCase();
  if (ownership === "PRIBADI" || ownership === "MILIK_PRIBADI") return "PRIBADI";
  if (ownership === "VENDOR" || ownership === "SEWA" || ownership === "ORANG_LAIN") {
    return "VENDOR";
  }
  return null;
}

export function getVehicleOwnershipLabel(value) {
  const ownership = normalizeVehicleOwnership(value);
  if (ownership === "VENDOR") return "Vendor";
  if (ownership === "PRIBADI") return "Pribadi";
  return "Belum diketahui";
}

export function getDeliveryOrderOwnership(order) {
  const shipments = Array.isArray(order.shipments) ? order.shipments : [];
  if (shipments.length === 0) return normalizeVehicleOwnership(order.jenisKendaraan);

  const ownerships = shipments.map((shipment) =>
    normalizeVehicleOwnership(shipment.jenisKendaraan)
  );
  if (ownerships.some((ownership) => ownership == null)) return null;

  const uniqueOwnerships = new Set(ownerships);
  return uniqueOwnerships.size === 1 ? ownerships[0] : "MIXED";
}

export function getDeliveryOrderFinancials(order) {
  const gross = Number(order.biayaEkspedisi) || 0;
  const storedPph2 = order.pph2Persen == null ? null : Number(order.pph2Persen);
  const pph2 = Number.isFinite(storedPph2) ? storedPph2 : Math.round(gross * 0.02);
  const ownership = getDeliveryOrderOwnership(order);
  const rawDriverExpense =
    order.uangJalanSupir == null ? null : Number(order.uangJalanSupir);
  const driverExpense =
    Number.isFinite(rawDriverExpense) && rawDriverExpense >= 0 ? rawDriverExpense : null;

  let companyRevenue = null;
  let vendorPayment = null;
  if (ownership === "PRIBADI") {
    companyRevenue = gross - pph2;
    vendorPayment = 0;
  } else if (ownership === "VENDOR") {
    companyRevenue = Math.round(gross * 0.08);
    vendorPayment = gross - pph2 - companyRevenue;
  }

  return {
    gross,
    pph2,
    ownership,
    companyRevenue,
    vendorPayment,
    driverExpense,
    cashBeforeOtherExpenses:
      companyRevenue == null || driverExpense == null
        ? null
        : companyRevenue - driverExpense,
  };
}

export function getDirectorCashTotals(orders, otherExpenses) {
  const totals = {
    gross: 0,
    pph2: 0,
    companyRevenue: 0,
    vendorPayment: 0,
    driverExpense: 0,
    otherExpenses:
      Array.isArray(otherExpenses)
        ? otherExpenses.reduce((sum, expense) => sum + (Number(expense.nominal) || 0), 0)
        : null,
    cashBeforeOtherExpenses: 0,
    cashBalance: null,
    missingOwnershipCount: 0,
    mixedOwnershipCount: 0,
    missingDriverExpenseCount: 0,
  };

  orders.forEach((order) => {
    const amounts = getDeliveryOrderFinancials(order);
    totals.gross += amounts.gross;
    totals.pph2 += amounts.pph2;

    if (amounts.companyRevenue == null) {
      totals.missingOwnershipCount += 1;
      if (amounts.ownership === "MIXED") totals.mixedOwnershipCount += 1;
    } else {
      totals.companyRevenue += amounts.companyRevenue;
      totals.vendorPayment += amounts.vendorPayment;
    }

    if (amounts.driverExpense == null) {
      totals.missingDriverExpenseCount += 1;
    } else {
      totals.driverExpense += amounts.driverExpense;
    }

    if (amounts.cashBeforeOtherExpenses != null) {
      totals.cashBeforeOtherExpenses += amounts.cashBeforeOtherExpenses;
    }
  });

  if (totals.missingOwnershipCount > 0) {
    totals.companyRevenue = null;
    totals.vendorPayment = null;
  }
  if (totals.missingDriverExpenseCount > 0) {
    totals.driverExpense = null;
  }

  if (
    totals.otherExpenses != null &&
    totals.missingOwnershipCount === 0 &&
    totals.missingDriverExpenseCount === 0
  ) {
    totals.cashBalance = totals.cashBeforeOtherExpenses - totals.otherExpenses;
  }

  return totals;
}
