import ApiClient from "./client";

export const superadminApi = {
  async overview() {
    const response = await ApiClient.get("/admin");
    return response.data;
  },

  async create(resource, payload) {
    const response = await ApiClient.post(`/admin/${resource}`, payload);
    return response.data;
  },

  async update(resource, id, payload) {
    const response = await ApiClient.patch(`/admin/${resource}/${encodeURIComponent(id)}`, payload);
    return response.data;
  },

  async createReport(orderId, payload) {
    const response = await ApiClient.post(
      `/admin/delivery-orders/${encodeURIComponent(orderId)}/reports`,
      payload
    );
    return response.data;
  },

  async updateReport(orderId, reportId, payload) {
    const response = await ApiClient.patch(
      `/admin/delivery-orders/${encodeURIComponent(orderId)}/reports/${encodeURIComponent(reportId)}`,
      payload
    );
    return response.data;
  },
};
