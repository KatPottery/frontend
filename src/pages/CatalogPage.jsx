import React, { useEffect, useState } from "react";
import axios from "axios";
import ZoomableImage from "../components/ZoomableImage";
import "./CatalogPage.css";

const asArray = (x) => (Array.isArray(x) ? x : []);

export default function UserCatalogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    axios
      .get("/api/catalog", { withCredentials: true })
      .then((res) => {
        const data = res?.data;
        if (!Array.isArray(data)) {
          console.warn("Unexpected /api/catalog response:", data);
        }
        if (alive) setItems(asArray(data));
      })
      .catch((err) => {
        console.error("Failed to load catalog:", err);
        if (alive) {
          setError(err);
          setItems([]);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return null; // or a spinner
  if (error)
    return (
      <div style={{ padding: 16, color: "crimson" }}>
        Couldn’t load catalog. Try refreshing the page.
      </div>
    );
  if (!items.length)
    return (
      <div style={{ padding: 16 }}>
        No items found in the catalog yet.
      </div>
    );

  return (
    <div className="page-wrapper">
      <div className="masonry">
        {items.map((item, index) => {
          const firstImage = asArray(item.images)[0];
          return (
            <div className="catalog-item" key={item._id || index}>
              <ZoomableImage
                src={firstImage?.url || "/placeholder.jpg"}
                alt={item?.title || "Catalog item"}
                className="catalog-img"
              />
              <div className="caption">
                <span className="title">{item?.title || "Untitled"}</span>
                <span className="year">
                  {item?.yearMade != null ? item.yearMade : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
