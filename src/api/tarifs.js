import ApiClient from "./client";

export const tarifApi = {
  async list() {
    const res = await ApiClient.get("/tarif");
    return res.data || [];
  },

  async getById(id) {
    const res = await ApiClient.get(`/tarif/${id}`);
    return res.data || null;
  },
};
