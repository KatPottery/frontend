import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ShopPage from "./pages/ShopPage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import MaintenancePage from "./pages/MaintenancePage";
import SuccessPage from "./pages/CheckoutSuccessPage";
import CancelPage from "./pages/CheckoutCancelPage";
import PublicLayout from "./components/PublicLayout";
import AboutPage from "./pages/AboutMe";  

import AdminLayout from "./admin/AdminLayout";
import AdminCatalogPage from "./admin/AdminCatalogPage";
import AdminImageUpload from "./admin/AdminUploadItem";
import AdminProductPage from "./admin/AdminProductPage";
import EditProductPage from "./admin/EditProductPage";
import PageViewsPage from "./admin/PageViewsPage";
import IncomePage from "./admin/IncomePage";
import CartsPage from "./admin/CartsPage";
import SubscribersPage from "./admin/SubscribersPage";


/* guard for admin routes */
function AdminRoute() {
  return <Outlet />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} /> {/* ← added route */}
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/checkout/success" element={<SuccessPage />} />
          <Route path="/checkout/cancel" element={<CancelPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminCatalogPage />} />
            <Route path="catalog" element={<AdminCatalogPage />} />
            <Route path="upload" element={<AdminImageUpload />} />
            <Route path="products" element={<AdminProductPage />} />
            <Route path="products/:id/edit" element={<EditProductPage />} />
            <Route path="pageviews" element={<PageViewsPage />} />
            <Route path="income" element={<IncomePage />} />
            <Route path="carts" element={<CartsPage />} />
            <Route path="subscribers" element={<SubscribersPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
