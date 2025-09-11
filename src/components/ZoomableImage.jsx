import { useState } from "react";
import "./ZoomableImage.css";

export default function ZoomableImage({ src, alt, className = "", style = {} }) {
  const [zoomed, setZoomed] = useState(false);

  const toggleZoom = (e) => {
    if (e.target.closest("a") || e.target.closest("Link")) return;
    setZoomed(!zoomed);
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`zoomable-image ${className}`}
        style={style}
        onClick={toggleZoom}
      />

      {zoomed && (
        <div className="zoom-overlay" onClick={() => setZoomed(false)}>
          <img src={src} alt={alt} className="zoomed-in-image" />
        </div>
      )}
    </>
  );
}
