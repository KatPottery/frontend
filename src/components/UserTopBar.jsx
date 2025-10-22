import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import SkibidiPageView from "./SkibidiPageView";
import "./UserTopBar.css";
import Footer from "./Footer";

export default function UserTopBar() {
  return (
    <div className="user-layout">
      <SkibidiPageView />
      <div className="top-bar">
        <div className="menu-icon">☷</div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/catalog">Catalog</Link>
          <Link to="/about">About Me</Link>
          <Link to="/cart" className="cart-icon">
            <FaShoppingCart size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
