import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../redux";

export default function AdminProtectedRoute() {
  const { access_token, user, isHydrated } = useAppSelector((s) => s.auth);

  if (!isHydrated) return null;

  if (!access_token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
