import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../redux";

export default function AdminRoute() {
  const { user } = useAppSelector((s) => s.auth);

  const isAdmin = user?.role === "admin";

  if (!isAdmin) return <Navigate to="/project-tracking" replace />;

  return <Outlet />;
}
