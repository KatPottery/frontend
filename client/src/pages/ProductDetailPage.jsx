import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./ProductDetailPage.css";
import { getSessionId } from "../utils/session";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    axios.get(`/api/products/${slug}`)
      .then(res => {
        setProduct(res.data);
        setSelectedImage(res.data.images?.[0]?.url || null);
      })
      .catch(err => console.error("Error loading product:", err));
  }, [slug]);

  const handleAddToCart = async () => {
    try {
      const sessionId = getSessionId();
      console.log("sessionId:", sessionId);
      console.log("productId:", product?._id);
      console.log("quantity:", selectedQuantity);

      await axios.post("/api/cart/add", {
        sessionId,
        productId: product._id,
        quantity: selectedQuantity,
      });
      setSelectedQuantity(1);
      alert("Added to cart!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Could not add to cart.");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-detail-layout">
      <div className="product-image">
        <img
          src={selectedImage}
          alt={product.title}
          className="main-image"
          onClick={() => setIsZoomed(true)}
          style={{ cursor: "zoom-in" }}
        />

        {product.images?.length > 1 && (
          <div className="thumbnail-container">
            <div className="thumbnail-row-scroll">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`Thumbnail ${i}`}
                  className={`thumbnail ${selectedImage === img.url ? "active" : ""}`}
                  onClick={() => setSelectedImage(img.url)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isZoomed && (
        <div className="zoom-overlay" onClick={() => setIsZoomed(false)}>
          <img src={selectedImage} alt="Zoomed view" className="zoomed-image" />
        </div>
      )}

      <div className="product-info">
        <h1>{product.title}</h1>
        <p className={`price ${product.sold ? "sold" : ""}`}>
          ${Number(product.price).toLocaleString()}
        </p>
        <p className="note">Tax included. Shipping cost calculated at checkout</p>

        <h3>Description:</h3>
        <p>{product.description || "No description available."}</p>

        <h3>Materials and Measurements:</h3>
        <p>{product.materials || "N/A"}</p>
        <p>Width: {product.width || "xx"} Height: {product.height || "xx"}</p>
        <p>Weight: {product.weight || "xx"}</p>

        <h3>Dishwasher safe:</h3>
        <p>{product.dishwasherSafe ? "Yes" : "No"}</p>

        {product.isPrint ? (
          <p className="stock-info">In stock: {product.stock}</p>
        ) : (
          <p className="stock-info">One of a kind</p>
        )}
        <p style={{ fontSize: "12px", color: "gray" }}>Debug: isPrint = {JSON.stringify(product.isPrint)}</p>

        <div className="actions">
          <button
            className="buy-now"
            disabled={product.sold}
            style={{ opacity: product.sold ? 0.5 : 1 }}
          >
            {product.sold ? "SOLD" : "Buy Now"}
          </button>
          {product?.isPrint && !product?.sold && (
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={product.stock || 99}
                value={selectedQuantity}
                onChange={(e) => {
                  const value = Math.min(Math.max(1, Number(e.target.value)), product.stock || 99);
                  setSelectedQuantity(value);
                }}
              />
              <span style={{ marginLeft: "8px" }}>in stock: {product.stock}</span>
            </div>
          )}
          <button
            className="add-to-cart"
            disabled={product.sold}
            onClick={!product.sold ? handleAddToCart : undefined}
            style={{ opacity: product.sold ? 0.5 : 1 }}
          >
            {product.sold ? "SOLD" : "Add To Cart"}
          </button>
        </div>
        <div className="payments">
          <img src="/images/payment-methods.png" alt="Payment options" />
        </div>
      </div>
    </div>
  );
}
