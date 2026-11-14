import ApiClient from "./client";

export const pengeluaranLainApi = {
  async list(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.kategori && params.kategori !== "SEMUA") query.append("kategori", params.kategori);

    const queryString = query.toString();
    const endpoint = queryString ? `/pengeluaran-lain?${queryString}` : "/pengeluaran-lain";
    const res = await ApiClient.get(endpoint);
    return res.data || [];
  },

  async create(payload) {
    const res = await ApiClient.post("/pengeluaran-lain", payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await ApiClient.put(`/pengeluaran-lain/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await ApiClient.delete(`/pengeluaran-lain/${id}`);
    return res;
  },
};

