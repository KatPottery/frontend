import React, { useEffect, useState } from "react";
import axios from "axios";
import ZoomableImage from "../components/ZoomableImage";
import "./CatalogPage.css";

export default function UserCatalogPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("/api/catalog")
      .then(res => setItems(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="page-wrapper">
      <div className="masonry">
        {items.map((item, index) => (
          <div className="catalog-item" key={item._id || index}>
            <ZoomableImage
              src={item.images?.[0]?.url}
              alt={item.title}
              className="catalog-img"
            />
            <div className="caption">
              <span className="title">{item.title}</span>
              <span className="year">{item.year}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
