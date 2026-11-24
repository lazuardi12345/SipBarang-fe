import test from "node:test";
import assert from "node:assert/strict";
import {
  getDeliveryOrderFinancials,
  getDirectorCashTotals,
} from "./deliveryOrderFinance.js";

test("private SO contributes 98 percent less its driver allowance", () => {
  const amounts = getDeliveryOrderFinancials({
    biayaEkspedisi: 1_000_000,
    uangJalanSupir: 50_000,
    shipments: [{ jenisKendaraan: "PRIBADI" }],
  });

  assert.equal(amounts.pph2, 20_000);
  assert.equal(amounts.companyRevenue, 980_000);
  assert.equal(amounts.vendorPayment, 0);
  assert.equal(amounts.cashBeforeOtherExpenses, 930_000);
});

test("legacy SEWA is treated as Vendor with an 8/90 percent split", () => {
  const amounts = getDeliveryOrderFinancials({
    biayaEkspedisi: 1_000_000,
    pph2Persen: 20_000,
    uangJalanSupir: 50_000,
    shipments: [{ jenisKendaraan: "SEWA" }],
  });

  assert.equal(amounts.ownership, "VENDOR");
  assert.equal(amounts.companyRevenue, 80_000);
  assert.equal(amounts.vendorPayment, 900_000);
  assert.equal(amounts.cashBeforeOtherExpenses, 30_000);
});

test("mixed ownership or missing SO costs makes the cash balance incomplete", () => {
  const totals = getDirectorCashTotals(
    [{
      biayaEkspedisi: 1_000_000,
      uangJalanSupir: null,
      shipments: [
        { jenisKendaraan: "PRIBADI" },
        { jenisKendaraan: "VENDOR" },
      ],
    }],
    []
  );

  assert.equal(totals.mixedOwnershipCount, 1);
  assert.equal(totals.missingDriverExpenseCount, 1);
  assert.equal(totals.companyRevenue, null);
  assert.equal(totals.vendorPayment, null);
  assert.equal(totals.driverExpense, null);
  assert.equal(totals.cashBalance, null);
});

test("other expenses reduce the combined SO cash balance", () => {
  const totals = getDirectorCashTotals(
    [
      {
        biayaEkspedisi: 1_000_000,
        uangJalanSupir: 50_000,
        shipments: [{ jenisKendaraan: "PRIBADI" }],
      },
      {
        biayaEkspedisi: 1_000_000,
        uangJalanSupir: 50_000,
        shipments: [{ jenisKendaraan: "VENDOR" }],
      },
    ],
    [{ nominal: 10_000 }]
  );

  assert.equal(totals.companyRevenue, 1_060_000);
  assert.equal(totals.vendorPayment, 900_000);
  assert.equal(totals.driverExpense, 100_000);
  assert.equal(totals.otherExpenses, 10_000);
  assert.equal(totals.cashBalance, 950_000);
});
