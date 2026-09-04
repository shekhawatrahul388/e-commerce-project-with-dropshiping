import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Address from "./pages/Address";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDeshboard";
import AdminProducts from "./admin/AdminProducts";
import AdminCategories from "./admin/AdminCategories";
import AdminSuppliers from "./admin/AdminSuppliers";
import AdminBanners from "./admin/AdminBanners";
import AdminFooter from "./admin/AdminFooter";
import AdminWhatsapp from "./admin/AdminWhatsapp";
import AdminUsers from "./admin/AdminUser";
import AdminSetting from "./admin/AdminSetting";
import PublicStore from "./pages/PublicStore";
import CreateStore from "./pages/CreateStore";
import StoreDashboard from "./pages/StoreDashboard";

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <h1 className="text-3xl font-bold">Page Not Found</h1>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen">
      {!isAdminPage && <Navbar />}
      <Routes>
        <Route path="/store/:storeSlug" element={<PublicStore />} />
        <Route path="/" element={<Home />} />
        <Route path="/send-otp" element={<Register />} />
        <Route path="/verify-otp" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/productdetails" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryProducts />} />
        <Route path="/category/:id" element={<CategoryProducts />} />
        <Route path="/category-products" element={<CategoryProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/address" element={<Address />} />
        <Route
          path="/my-products"
          element={
            <Navigate to="/store-dashboard" replace />
          }
        />
        <Route path="/create-store" element={<ProtectedRoute><CreateStore /></ProtectedRoute>} />
        <Route path="/store-dashboard" element={<ProtectedRoute><StoreDashboard /></ProtectedRoute>} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="layout" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="footer" element={<AdminFooter />} />
            <Route path="whatsapp" element={<AdminWhatsapp />} />
            
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSetting />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default App;
