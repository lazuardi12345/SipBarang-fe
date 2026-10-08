export const APP_CONFIG = {
  apiBaseUrl: (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, ""),
  appName: "SIPBarang",
  companyName: "PT ALMIRA YUNIAR TREK",
};

export const APP_ROUTES = {
  home: "/dashboard",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  pengiriman: "/dashboard/pengiriman",
  masterTujuan: "/dashboard/master-tujuan",
  draftSuratJalan: "/dashboard/draft-surat-jalan",
  approval: "/dashboard/approval",
  pelaporan: "/dashboard/pelaporan",
  riwayat: "/dashboard/riwayat",
  invoice: "/dashboard/invoice",
};
