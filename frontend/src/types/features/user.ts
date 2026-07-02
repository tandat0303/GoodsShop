import type { Pagination } from "../common/pagination";

export interface User {
  email: string;
  fullName: string;
  role: string;
}

export type Role = "admin" | "user";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface UserResponse {
  data: AppUser[];
  pagination: Pagination;
}

export interface UserFormValues {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export type UpdateFormValues = Partial<UserFormValues>;

export type FormErrors = Partial<Record<keyof UserFormValues, string>>;

export interface UserActionResponse {
  message: string;
}
