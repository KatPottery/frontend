import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSessionId } from "../utils/session";
import "./CartPage.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";

// adding stripe
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe("pk_test_YOUR_STRIPE_PUBLISHABLE_KEY");

// merge duplicate items in cart (mainly prints)
function mergeCartItems(items) {
  const merged = {};
  for (const item of items) {
    const id = item._id;
    if (!merged[id]) {
      merged[id] = { ...item };
    } else {
      merged[id].quantity += item.quantity || 1;
    }
  }
  return Object.values(merged);
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutNote, setCheckoutNote] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
        try {
        const sessionId = getSessionId();
        const res = await axios.get(`/api/cart/${sessionId}`);
        if (res.data.isOrdered) {
            setCartItems(mergeCartItems(res.data.items || []));
        } else {
            setCartItems(res.data.items || []);
        }

        } catch (err) {
        console.error("Failed to load cart:", err);
        setCartItems([]);
        }
    };
    fetchCart();
  }, []);

    const goToProduct = async (id) => {
        try {
            const res = await axios.get(`/api/products/id/${id}`);
            const slug = res.data.slug;
            navigate(`/product/${slug}`);
        } catch (err) {
            console.error("Failed to fetch product slug:", err);
        }
    };
        const handleDelete = async (productId) => {
    try {
        const sessionId = getSessionId();
        await axios.delete(`/api/cart/${sessionId}/${productId}`);
        setCartItems(prev => prev.filter(item => item._id !== productId));
    } catch (err) {
        console.error("Failed to delete item:", err);
        alert("Could not remove item from cart.");
    }
    };

    const handleCheckout = async () => {
      const stripe = await stripePromise;
      const sessionId = getSessionId(); // cart session

      try {
        const res = await axios.post("/api/checkout/create-checkout-session", {
          sessionId,     
          items: cartItems,   // items in cart
          email: checkoutEmail,
          name: checkoutName,
          pickupNote: checkoutNote,
        });

        console.log("Stripe session ID:", res.data.sessionId);

        await stripe.redirectToCheckout({
          sessionId: res.data.sessionId, 
        });

      } catch (err) {
        console.error("Stripe checkout error:", err.response?.data || err.message || err);
        alert("Failed to redirect to Stripe checkout.");
      }
    };


  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item?.price || 0),
    0
  );
  console.log("cartItems:", cartItems);

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
                        <p>${item.price.toFixed(2)}</p>
                        </div>
                    </div>

                    <button
                        className="cart-delete-button"
                        onClick={() => handleDelete(item._id)}
                        title="Remove from cart"
                    >
                        <FaTrashAlt />
                    </button>
                    </div>
                    ))
                )}
            </div>
        </div>
            <div className="cart-summary">
                <h4>Subtotal ({cartItems.length} item{cartItems.length !== 1 && "s"}):</h4>
                <h3>${subtotal.toFixed(2)}</h3>
                {showCheckout ? (
                    <div>
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
                        <button
                        type="button"
                        className="checkout-button"
                        onClick={handleCheckout}
                        >
                        Pay with Card
                        </button>
                    </div>
                    </div>
                ) : (
                    <button
                        className="checkout-button"
                        onClick={() => setShowCheckout(true)}
                    >
                        Proceed to Checkout
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
