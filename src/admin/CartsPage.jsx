import { useEffect, useState } from "react";
import axios from "axios";
import "./css/CartsPage.css"; 

export default function CartsPage() {
  const [carts, setCarts] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/carts")
      .then(res => setCarts(res.data))
      .catch(err => console.error("Failed to load carts", err));
  }, []);

  return (
    <div className="carts-page">
      <h2>All Carts</h2>
      <table className="carts-table">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Email</th>
            <th>Item Count</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {carts.map(cart => (
            <tr key={cart._id}>
              <td>{cart.sessionId}</td>
              <td>{cart.email || "Guest"}</td>
              <td>{cart.items.length}</td>
              <td>{cart.isOrdered ? "Completed" : "Pending"}</td>
              <td>{new Date(cart.lastUpdated).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}