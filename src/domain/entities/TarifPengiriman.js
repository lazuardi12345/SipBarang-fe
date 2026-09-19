/**
 * Domain Entity: TarifPengiriman
 * Data master tarif ongkos kirim per tujuan.
 */

export function hitungTotalSetelahPPh(total) {
  const pph2 = Math.round(total * 0.02);
  return total - pph2;
}
