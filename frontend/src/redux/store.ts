import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux//features/authSlice";
import storage from "../libs/storage";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

store.subscribe(() => {
  const { isHydrated, access_token, refresh_token, user } =
    store.getState().auth;

  if (!isHydrated) return;

  if (access_token && refresh_token && user) {
    storage.set("auth", { access_token, refresh_token, user });
  } else {
    storage.remove("auth");
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
