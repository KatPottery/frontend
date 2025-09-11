import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ShopPage from "./pages/ShopPage";
import CatalogPage from "./pages/CatalogPage";
import AdminImageUpload from "./admin/AdminUploadItem";
import AdminCatalogPage from './admin/AdminCatalogPage';
import AdminLayout from './admin/AdminLayout';
import AdminProductPage from './admin/AdminProductPage';
import ProductDetailPage from "./pages/ProductDetailPage";
import EditProductPage from "./admin/EditProductPage";
import CartPage from "./pages/CartPage";
import PageViewsPage from "./admin/PageViewsPage";
import IncomePage from "./admin/IncomePage";
import MaintenancePage from "./pages/MaintenancePage";
import PublicLayout from "./components/PublicLayout";
import CartsPage from "./admin/CartsPage";
import SubscribersPage from "./admin/SubscribersPage";
import SuccessPage from "./pages/CheckoutSuccessPage";
import CancelPage from "./pages/CheckoutCancelPage";


export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/checkout/success" element={<SuccessPage />} />
          <Route path="/checkout/cancel" element={<CancelPage />} />
        </Route>

        {/* Admin Section */}
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="/admin/catalog" element={<AdminCatalogPage />} />
        <Route path="/admin/upload" element={<AdminImageUpload />} />
        <Route path="/admin/products" element={<AdminProductPage />} />
        <Route path="/admin/products/:id/edit" element={<EditProductPage />} />
        <Route path="/admin/pageviews" element={<PageViewsPage />} />
        <Route path="/admin/income" element={<IncomePage />} />
        <Route path="/admin/carts" element={<CartsPage />} />
        <Route path="/admin/subscribers" element={<SubscribersPage />} />
      </Routes>
    </Router>
  );
}
