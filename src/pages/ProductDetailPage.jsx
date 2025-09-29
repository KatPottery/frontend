import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ProductDetailPage.css";
import { getSessionId } from "../utils/session";

const asNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const asBool = (v) =>
  v === true || v === "true" || v === 1 || v === "1" || v === "on";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const clickGuard = useRef(false);

  useEffect(() => {
    axios
      .get(`/api/products/${slug}`)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        setSelectedImage(p.images?.[0]?.url || null);
        const stockVal = asNum(p.stock, 0);
        setSelectedQuantity(p.isPrint ? (stockVal > 0 ? 1 : 0) : 1);
      })
      .catch((err) => console.error("Error loading product:", err));
  }, [slug]);

  if (!product) return <p>Loading...</p>;

  const isPrint = asBool(product.isPrint);
  const stockVal = asNum(product.stock, 0);
  const outOfStock = isPrint && stockVal <= 0;
  const disablePurchase = !!product.sold || outOfStock;

  const widthVal = asNum(product.width ?? product.dimensions?.width, 0);
  const heightVal = asNum(product.height ?? product.dimensions?.height, 0);

  const weightVal = asNum(product.pottery?.weight ?? product.weight, 0);
  const dishwasherSafe = asBool(
    (product.pottery?.dishwasherSafe ?? product.dishwasherSafe) || false
  );

  const fmtDim = (n) => (n > 0 ? `${n} mm` : "—");
  const fmtWeight = (g) => (g > 0 ? `${g} g` : "—");

  const handleAddToCart = async () => {
    try {
      if (adding || clickGuard.current || !product?._id || disablePurchase) return;

      clickGuard.current = true;
      setAdding(true);

      const sessionId = getSessionId();

      await axios.post("/api/cart/add", {
        sessionId,
        productId: product._id,
        quantity: isPrint
          ? Math.max(1, Math.min(selectedQuantity, stockVal || 1))
          : 1,
        variant: product.variant || product.options || null,
        isPrint: !!product.isPrint,
        idemKey: crypto.randomUUID?.() || String(Date.now()) + Math.random(),
      });

      if (isPrint) setSelectedQuantity(1);
      alert("Added to cart!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert(err?.response?.data?.error || "Could not add to cart.");
    } finally {
      setAdding(false);
      clickGuard.current = false;
    }
  };

  return (
    <div className="product-detail-layout">
      <div className="product-image">
        <img
          src={selectedImage}
          alt={product.title}
          className="main-image"
          onClick={() => selectedImage && setIsZoomed(true)}
          style={{ cursor: selectedImage ? "zoom-in" : "default" }}
        />

        {product.images?.length > 1 && (
          <div className="thumbnail-container">
            <div className="thumbnail-row-scroll">
              {product.images.map((img, i) => (
                <div
                  className="thumbnail-box"
                  key={img._id || img.url || `thumb-${i}`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${i}`}
                    className={selectedImage === img.url ? "active" : ""}
                    onClick={() => setSelectedImage(img.url)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isZoomed && selectedImage && (
        <div className="zoom-overlay" onClick={() => setIsZoomed(false)}>
          <img src={selectedImage} alt="Zoomed view" className="zoomed-image" />
        </div>
      )}

      <div className="product-info">
        <h1>{product.title}</h1>

        <p className={`price ${product.sold ? "sold" : ""}`}>
          ${Number(product.price || 0).toLocaleString()}
        </p>
        <p className="note">Tax included. Shipping cost calculated at checkout</p>

        <h3>Description:</h3>
        <p>{product.description || "No description available."}</p>

        <h3>Materials and Measurements:</h3>
        <p>{product.materials || "N/A"}</p>
        <p>
          Width: {fmtDim(widthVal)} &nbsp; Height: {fmtDim(heightVal)}
        </p>

        {(product.category === "pottery" ||
          product.tag === "pottery" ||
          product.pottery ||
          product.weight != null ||
          product.dishwasherSafe != null) && (
          <>
            <p>Weight: {fmtWeight(weightVal)}</p>
            <h3>Dishwasher safe:</h3>
            <p>{dishwasherSafe ? "Yes" : "No"}</p>
          </>
        )}

        {isPrint ? (
          <p className="stock-info">
            {outOfStock ? "Out of stock" : `In stock: ${stockVal}`}
          </p>
        ) : (
          <p className="stock-info">
            {product.sold ? "Sold out" : "One of a kind"}
          </p>
        )}

        <div className="actions">
          <button
            className="buy-now"
            disabled={disablePurchase}
            style={{ opacity: disablePurchase ? 0.5 : 1 }}
            onClick={() => alert("Direct checkout coming soon")}
          >
            {disablePurchase
              ? isPrint
                ? "Buy Now Unavailable - Out of Stock"
                : "Buy Now Unavailable - Sold Out"
              : "Buy Now"}
          </button>

          <button
            className="add-to-cart"
            disabled={disablePurchase}
            onClick={!disablePurchase ? handleAddToCart : undefined}
            type="button"
            style={{ opacity: disablePurchase ? 0.5 : 1 }}
          >
            {disablePurchase
              ? isPrint
                ? "Add To Cart Unavailable - Out of Stock"
                : "Add To Cart Unavailable - Sold Out"
              : "Add To Cart"}
          </button>

          {isPrint && !outOfStock && (
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={stockVal || 1}
                value={selectedQuantity}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isNaN(n)) return;
                  setSelectedQuantity(Math.min(Math.max(1, n), stockVal || 1));
                }}
                onWheel={(e) => e.currentTarget.blur()}
              />
              <span style={{ marginLeft: "8px" }}>in stock: {stockVal}</span>
            </div>
          )}
        </div>

        <div className="payments">
          <img src="/images/payment-methods.png" alt="Payment options" />
        </div>
      </div>
    </div>
  );
}
