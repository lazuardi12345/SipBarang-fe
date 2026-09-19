import ApiClient from "./client";

export const authApi = {
  async login(email, password) {
    const res = await ApiClient.post("/auth/login", { email, password });
    if (res.data?.token) {
      ApiClient.setToken(res.data.token);
    }
    return res.data;
  },

  async register(input) {
    const res = await ApiClient.post("/auth/register", input);
    return res.data;
  },

  async getProfile() {
    const res = await ApiClient.get("/auth/me");
    return res.data;
  },
};
