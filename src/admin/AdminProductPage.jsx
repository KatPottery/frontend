import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./css/AdminLayout.css";
import "./css/AdminProductPage.css";

export default function AdminProductListPage() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const handleDelete = async (productId, title) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    try {
      await axios.delete(`/api/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  const handleEdit = (productId) => {
    navigate(`/admin/products/${productId}/edit`);
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <h2>All Products</h2>
        <button
          onClick={() => navigate("/admin/upload")}
          style={{ marginBottom: "20px" }}
        >
          Upload New Item
        </button>
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Sold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod._id}>
                <td>
                  <img
                    src={prod.images?.[0]?.url}
                    alt={prod.title}
                    width="80"
                    style={{ borderRadius: "6px", objectFit: "cover" }}
                  />
                </td>
                <td>{prod.title}</td>
                <td>${prod.price}</td>
                <td>{prod.sold ? "Yes" : "No"}</td>
                <td>
                  <button
                    onClick={() => handleEdit(prod._id)}
                    style={{ marginRight: "10px" }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(prod._id, prod.title)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
