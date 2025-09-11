import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ShopPage.css";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedTag, setSelectedTag] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    axios.get("/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to load products", err));
  }, []);

  const filtered = selectedTag
    ? products.filter(p => p.tag === selectedTag)
    : products;

  // sold items at the bottom
  const sortedProducts = [...filtered].sort((a, b) => {
  if (a.sold !== b.sold) {
    return a.sold ? 1 : -1;
  }
  if (sortOrder === "asc") return a.price - b.price;
  if (sortOrder === "desc") return b.price - a.price;
  
  return 0;
});


  return (
    <div className="shop-container">
      <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? "✖" : "☰ Filters"}
      </button>

     <div className={`filter-panel ${showFilters ? "open" : ""}`}>
        <h3>Filters</h3>

        <label>Type</label>
        <select onChange={(e) => setSelectedTag(e.target.value)} value={selectedTag}>
          <option value="">All Types</option>
          <option value="pottery">Pottery</option>
          <option value="painting">Painting</option>
          <option value="drawing">Drawing</option>
        </select>

        <label>Sort by Price</label>
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="asc">Low → High</option>
          <option value="desc">High → Low</option>
        </select>
      </div>

      <div className="product-grid">
        {sortedProducts.map(product => (
          <Link
            key={product._id}
            to={`/product/${product.slug}`}
            className={`product-card ${product.sold ? "sold" : ""}`}
          >
            <div className="image-wrapper">
              <img src={product.images?.[0]?.url} alt={product.title} />
              {product.sold && <div className="sold-overlay">SOLD</div>}
            </div>
            <div className="product-text">
              <p className="title">{product.title}</p>
              <p className={`price ${product.sold ? "sold-price" : ""}`}>
                ${Number(product.price).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
