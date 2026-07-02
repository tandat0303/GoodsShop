import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/features/user";
import type { AuthSlice } from "../../types/features/auth";

export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  access_token: null,
  refresh_token: null,
  isAuthenticated: false,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<AuthSlice>) {
      state.access_token = action.payload.access_token ?? null;
      state.refresh_token = action.payload.refresh_token ?? null;
      state.user = action.payload.user ?? null;
      state.isAuthenticated = true;
    },

    logout(state) {
      state.access_token = null;
      state.refresh_token = null;
      state.user = null;
      state.isAuthenticated = false;
    },

    hydrateAuth(state, action: PayloadAction<AuthSlice | null>) {
      if (action.payload) {
        state.access_token = action.payload.access_token ?? null;
        state.refresh_token = action.payload.refresh_token ?? null;
        state.user = action.payload.user ?? null;
        state.isAuthenticated = true;
      } else {
        state.access_token = null;
        state.refresh_token = null;
        state.user = null;
        state.isAuthenticated = false;
      }

      state.isHydrated = true;
    },
  },
});

export const { setToken, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
