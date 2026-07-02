import Login from "./pages/User/Login";
// import MainLayout from "./layout/MainLayout";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import AuthBootstrap from "./routes/AuthBootstrap";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/User/Home";
import MainLayout from "./components/layout/MainLayout";
import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/Dashboard";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminMainLayout from "./pages/Admin/layout/AdminMainLayout";
import ProductsManagement from "./pages/Admin/main/ProductsManagement";
import UsersManagement from "./pages/Admin/main/UsersManagement";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthBootstrap />}>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Route>

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminMainLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route
              path="/admin/products-mgmt"
              element={<ProductsManagement />}
            />
            <Route path="/admin/users-mgmt" element={<UsersManagement />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
