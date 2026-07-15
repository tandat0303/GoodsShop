import Login from "./pages/User/Login";
import "./index.css";
import { Outlet, Route, Routes } from "react-router-dom";
import AuthBootstrap from "./routes/AuthBootstrap";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/User/Home";
import MainLayout from "./components/layout/MainLayout";
import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/Dashboard";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminMainLayout from "./pages/Admin/layout/AdminMainLayout";
import ProductsManagement from "./pages/Admin/main/Products/ProductsManagement";
import UsersManagement from "./pages/Admin/main/UsersManagement";
import CategoryManagement from "./pages/Admin/main/CategoryManagement";
import BrandManagement from "./pages/Admin/main/BrandManagement";
import OrdersManagement from "./pages/Admin/main/Orders/OrdersManagement";
import UserOrders from "./pages/User/Orders/UserOrders";
import { CartProvider } from "./contexts/CartContext";
import PaymentResult from "./pages/User/Orders/PaymentResult";

function CartLayout() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthBootstrap />}>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<CartLayout />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<UserOrders />} />
              <Route path="/payment/result" element={<PaymentResult />} />
            </Route>
          </Route>
        </Route>

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminMainLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/orders-mgmt" element={<OrdersManagement />} />
            <Route
              path="/admin/products-mgmt"
              element={<ProductsManagement />}
            />
            <Route
              path="/admin/categories-mgmt"
              element={<CategoryManagement />}
            />
            <Route path="/admin/brands-mgmt" element={<BrandManagement />} />
            <Route path="/admin/users-mgmt" element={<UsersManagement />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
