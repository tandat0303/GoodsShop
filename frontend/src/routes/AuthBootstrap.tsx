import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux";
import storage from "../libs/storage";
import { hydrateAuth } from "../redux/features/authSlice";
import Loading from "../components/ui/Loading";
import { Outlet } from "react-router-dom";

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const { isHydrated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    const auth = storage.get("auth");
    dispatch(hydrateAuth(auth ?? null));
  }, [dispatch]);

  const isReady = isHydrated;

  if (!isReady) {
    return <Loading fullScreen />;
  }

  return <Outlet />;
}
