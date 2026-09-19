export const APP_NAME = "SIPBarang";
export const COMPANY_NAME = "PT ALMIRA YUNIAR TREK";
export const COMPANY_ADDRESS =
  "Jl. Industri Tengsaw, Kp. Babakan, Ds. Tarikolot, Kec. Citeureup, Kab. Bogor, Prov. Jawa Barat. 16810.";
export const COMPANY_PHONE = "081218739998";
export const COMPANY_EMAIL = "almirayuniartrek@gmail.com";

export const SESSION_KEY = "sipbarang_session";
export const TOKEN_KEY = "token";

export const UserRole = {
  DIREKTUR: "DIREKTUR",
  ADMIN: "ADMIN",
};

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

export const StatusInvoice = {
  BELUM_LUNAS: "BELUM_LUNAS",
  LUNAS: "LUNAS",
};
