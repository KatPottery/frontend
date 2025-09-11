import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSessionId } from "../utils/session";
import "./CartPage.css";
import { Link, useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_YOUR_STRIPE_PUBLISHABLE_KEY");

function mergeCartItems(items) {
  const map = new Map();
  for (const it of items) {
    const id = it._id || it.productId;
    if (!map.has(id)) map.set(id, { ...it, quantity: Number(it.quantity ?? 1) });
    else map.get(id).quantity += Number(it.quantity ?? 1);
  }
  return Array.from(map.values());
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutNote, setCheckoutNote] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const sessionId = getSessionId();
        const res = await axios.get(`/api/cart/${sessionId}`);
        const rows = res.data?.items || [];
        setCartItems(mergeCartItems(rows));
      } catch {
        setCartItems([]);
      }
    })();
  }, []);

  const reload = async () => {
    const sessionId = getSessionId();
    const res = await axios.get(`/api/cart/${sessionId}`);
    setCartItems(mergeCartItems(res.data?.items || []));
  };

 const goToProduct = async (id) => {
  try {
    const { data } = await axios.get(`/api/products/id/${id}`);
    if (data?.slug) navigate(`/product/${data.slug}`);
  } catch (err) {
    console.error("goToProduct failed:", err);
    alert("Couldn't open this product. Please try again.");
  }
};


  const handleDelete = async (productId) => {
    try {
      const sessionId = getSessionId();
      await axios.delete(`/api/cart/${sessionId}/${productId}`);
      setCartItems((prev) => prev.filter((it) => it._id !== productId));
    } catch {
      alert("Could not remove item from cart.");
    }
  };

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const sessionId = getSessionId();
    const res = await axios.post("/api/checkout/create-checkout-session", {
      sessionId,
      items: cartItems,
      email: checkoutEmail,
      name: checkoutName,
      pickupNote: checkoutNote,
    });
    await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
  };

  // helper: clamp respecting stock and prints
const clampQty = (item, q) => {
  if (!item.isPrint) return 1;
  const stock = Number.isFinite(item.stock) ? item.stock : Infinity;
  return Math.max(0, Math.min(q, stock));
};

const setQuantity = async (item, newQty) => {
  const sessionId = getSessionId();
  const qty = clampQty(item, newQty);
  if (qty <= 0) {
    await handleDelete(item._id);
    return;
  }
  try {
    await axios.post("/api/cart/set-quantity", {
      sessionId,
      productId: item._id,
      quantity: qty,
    });
    await reload();
  } catch (err) {
    const msg = err?.response?.data?.error || "Could not update quantity";
    alert(msg);
    await reload();
  }
};


  const totalItems = cartItems.reduce((n, it) => n + (it.quantity ?? 1), 0);
  const subtotal = cartItems.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-layout">
          <div className="cart-items-wrapper">
            <h2>Shopping Cart</h2>

            <div className="cart-items">
              {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div className="cart-item" key={item._id}>
                    <div
                      className="cart-item-left"
                      onClick={() => goToProduct(item._id)}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={item.images?.[0]?.url} alt={item.title} />
                      <div className="cart-item-details">
                        <h4>{item.title}</h4>
                        <p>${Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="cart-item-right">
                      {item.isPrint ? (
                        <div className="qty-stepper">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => setQuantity(item, (item.quantity ?? 1) - 1)}
                            disabled={(item.quantity ?? 1) <= 1}
                          >
                            −
                          </button>
                          <span className="qty-num">{item.quantity ?? 1}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => setQuantity(item, (item.quantity ?? 1) + 1)}
                            disabled={
                              Number.isFinite(item.stock) &&
                              (item.quantity ?? 1) >= Number(item.stock)
                            }
                            title={
                              Number.isFinite(item.stock) &&
                              (item.quantity ?? 1) >= Number(item.stock)
                                ? `Max ${item.stock} in stock`
                                : ""
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="qty-fixed">×1</div>
                      )}
                      <button
                        className="cart-delete-button"
                        onClick={() => handleDelete(item._id)}
                        title="Remove from cart"
                        type="button"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="cart-summary">
            <h4>
              Subtotal ({totalItems} item{totalItems !== 1 && "s"}):
            </h4>
            <h3>${subtotal.toFixed(2)}</h3>

            {showCheckout ? (
              <div className="checkout-form">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Pickup Note (optional)"
                  value={checkoutNote}
                  onChange={(e) => setCheckoutNote(e.target.value)}
                />
                <button type="button" className="checkout-button" onClick={handleCheckout}>
                  Pay with Card
                </button>
              </div>
            ) : (
              <button className="checkout-button" onClick={() => setShowCheckout(true)}>
                Proceed to Checkout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
