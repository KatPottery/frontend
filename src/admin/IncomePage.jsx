import { useEffect, useState } from "react";
import axios from "axios";
import "./css/IncomePage.css";
import React from "react";

export default function IncomePage() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/income")
      .then(res => setOrders(res.data))
      .catch(err => console.error("Failed to load income data", err));
  }, []);

  const toggleExpanded = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="income-page">
      <h2>Monthly Orders</h2>
      <table className="income-table">
        <thead>
          <tr>
            <th></th>
            <th>Buyer</th>
            <th>Email</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
            {orders.map(order => (
                <React.Fragment key={order._id}>
                <tr>
                    <td>
                    <button onClick={() => toggleExpanded(order._id)}>
                        {expandedId === order._id ? "▾" : "▸"}
                    </button>
                    </td>
                    <td>{order.name}</td>
                    <td>{order.userEmail}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>${order.totalPrice.toFixed(2)}</td>
                </tr>

                {expandedId === order._id && (
                    <tr className="expanded-row">
                    <td colSpan="5">
                        <ul className="item-list">
                        {order.items.map((item, i) => (
                            <li key={item.title + i}>
                            {item.title} — ${item.price.toFixed(2)}
                            </li>
                        ))}
                        </ul>
                    </td>
                    </tr>
                )}
                </React.Fragment>
            ))}
            </tbody>

      </table>
    </div>
  );
}
