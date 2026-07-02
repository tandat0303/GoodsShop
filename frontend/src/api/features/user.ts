import type {
  AppUser,
  UpdateFormValues,
  UserFormValues,
  UserActionResponse,
  UserResponse,
} from "../../types/features/user";
import apiClient from "../apiClient";

const userApi = {
  getUsers: async (
    currentPage: number,
    pageSize: number,
    search?: string,
    role?: string,
  ): Promise<UserResponse> => {
    const params: Record<string, any> = { currentPage, pageSize };
    if (search) params.search = search;
    if (role) params.role = role;
    const res = await apiClient.get("/users", { params });
    return res.data;
  },

  getUser: async (id: string): Promise<AppUser> => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },

  createUser: async (payload: UserFormValues): Promise<UserActionResponse> => {
    const res = await apiClient.post("/users", payload);
    return res.data;
  },

  updateUser: async (
    id: string,
    payload: UpdateFormValues,
  ): Promise<UserActionResponse> => {
    const res = await apiClient.put(`/users/${id}`, payload);
    return res.data;
  },

  removeUser: async (id: string): Promise<UserActionResponse> => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
};

export default userApi;
