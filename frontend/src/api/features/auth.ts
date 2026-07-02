import type { AuthPayload, AuthResponse } from "../../types/features/auth";
import apiClient from "../apiClient";

const authApi = {
  login: async (payload: AuthPayload): Promise<AuthResponse> => {
    const res = await apiClient.post("/auth/login", payload);
    return res.data;
  },
};

export default authApi;
