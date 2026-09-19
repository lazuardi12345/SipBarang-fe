/**
 * Domain Entity: DeliveryOrder (DO)
 * Merepresentasikan satu pengiriman barang dari input, approval direktur,
 * sampai laporan barang terkirim.
 */

export const StatusDO = {
  PLANNING: "PLANNING",
  DRAFT: "DRAFT",
  MENUNGGU_ACC: "MENUNGGU_ACC",
  DISETUJUI: "DISETUJUI",
  DITOLAK: "DITOLAK",
  DALAM_PENGIRIMAN: "DALAM_PENGIRIMAN",
  MENUNGGU_KONFIRMASI: "MENUNGGU_KONFIRMASI",
  TERKIRIM: "TERKIRIM",
};

export const STATUS_LABEL = {
  [StatusDO.PLANNING]: "Draft (Tunggu SJ)",
  [StatusDO.DRAFT]: "Draft (Tunggu SJ)",
  [StatusDO.MENUNGGU_ACC]: "Menunggu ACC Direktur",
  [StatusDO.DISETUJUI]: "Disetujui (Bisa Berangkat)",
  [StatusDO.DITOLAK]: "Ditolak",
  [StatusDO.DALAM_PENGIRIMAN]: "Dalam Pengiriman",
  [StatusDO.MENUNGGU_KONFIRMASI]: "Menunggu ACC Terkirim",
  [StatusDO.TERKIRIM]: "Selesai (Terkirim)",
};
