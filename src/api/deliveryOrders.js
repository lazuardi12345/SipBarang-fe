import ApiClient from "./client";

export const deliveryOrderApi = {
  async list() {
    const res = await ApiClient.get("/delivery-orders");
    return res.data || [];
  },

  async listByStatus(status) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const res = await ApiClient.get(`/delivery-orders${query}`);
    return res.data || [];
  },

  async getById(id) {
    const res = await ApiClient.get(`/delivery-orders/${id}`);
    return res.data || null;
  },

  async create(orderInput) {
    const res = await ApiClient.post("/delivery-orders", orderInput);
    return res.data;
  },

  async consolidateRun(payload) {
    const res = await ApiClient.post("/delivery-orders/batch/consolidate-run", payload);
    return res.data;
  },

  async approve(id, catatan = "") {
    const res = await ApiClient.patch(`/delivery-orders/${id}/approve`, { catatan });
    return res.data;
  },

  async reject(id, catatan) {
    const res = await ApiClient.patch(`/delivery-orders/${id}/reject`, { catatan });
    return res.data;
  },

  async submit(id, docData = {}) {
    const res = await ApiClient.patch(`/delivery-orders/${id}/submit`, docData);
    return res.data;
  },

  async attachDocPerusahaan(id, { noDocPerusahaan, tglDocPerusahaan, keteranganDoc }) {
    const res = await ApiClient.patch(`/delivery-orders/${id}/attach-doc`, {
      noDocPerusahaan,
      tglDocPerusahaan,
      keteranganDoc,
    });
    return res.data;
  },

  async confirmDelivered(id, catatan = "") {
    const res = await ApiClient.patch(`/delivery-orders/${id}/confirm-delivered`, { catatan });
    return res.data;
  },

  async reportDelivery({ orderId, namaPenerimaBarang, catatanPelaporan, buktiPengirimanUrl }) {
    const res = await ApiClient.patch(`/delivery-orders/${orderId}/report`, {
      namaPenerimaBarang,
      catatanPelaporan,
      buktiPengirimanUrl,
    });
    return res.data;
  },

  async update(order) {
    if (order.status === "DISETUJUI") {
      return this.approve(order.id, order.catatanDirektur || "");
    }
    if (order.status === "DITOLAK") {
      return this.reject(order.id, order.catatanDirektur || "");
    }
    if (order.status === "TERKIRIM") {
      return this.reportDelivery({
        orderId: order.id,
        namaPenerimaBarang: order.namaPenerimaBarang,
        catatanPelaporan: order.catatanPelaporan,
        buktiPengirimanUrl: order.buktiPengirimanUrl,
      });
    }
    const res = await ApiClient.patch(`/delivery-orders/${order.id}`, order);
    return res.data;
  },
};
