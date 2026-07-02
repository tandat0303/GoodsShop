import type { User } from "./user";

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;

  message?: string;
  error?: string;
  statusCode?: number;
}

export type AuthSlice = Partial<AuthResponse>;

export interface LoginFormValue {
  email: string;
  password: string;
}
