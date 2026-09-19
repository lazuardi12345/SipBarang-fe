import { ApiClient } from "../http/apiClient";

export class ApiInvoiceRepository {
  async list() {
    const res = await ApiClient.get("/invoices");
    return res.data || [];
  }

  async findById(id) {
    const res = await ApiClient.get(`/invoices/${id}`);
    return res.data || null;
  }

  async create(invoiceInput) {
    const res = await ApiClient.post("/invoices", invoiceInput);
    return res.data;
  }

  async updateStatus(id, status) {
    const res = await ApiClient.patch(`/invoices/${id}/status`, { status });
    return res.data;
  }
}
