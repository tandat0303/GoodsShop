import type { User } from "../features/user";

export interface StorageSchema {
  auth: {
    user: User;
    access_token: string;
    refresh_token: string;
  };
}
