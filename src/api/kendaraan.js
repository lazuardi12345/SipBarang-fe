import ApiClient from "./client";

export const kendaraanApi = {
  async list() {
    const res = await ApiClient.get("/kendaraan");
    return res.data || [];
  },

  async create(payload) {
    const res = await ApiClient.post("/kendaraan", payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await ApiClient.patch(`/kendaraan/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await ApiClient.delete(`/kendaraan/${id}`);
    return res.data;
  },
};

