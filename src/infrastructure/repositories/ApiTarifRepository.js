import { ApiClient } from "../http/apiClient";

export class ApiTarifRepository {
  async list() {
    const res = await ApiClient.get("/tarif");
    return res.data || [];
  }

  async findById(id) {
    const res = await ApiClient.get(`/tarif/${id}`);
    return res.data || null;
  }
}
