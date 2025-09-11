import React, { useEffect, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import axios from "axios";
import "./LandingPage.css";

export default function LandingPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/api/products/carousel")
      .then(res => {
        console.log("Carousel products:", res.data);
        setProducts(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="carousel-wrapper">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        showArrows={true}
      >
        {products.map((product, index) => {
          const image = product.images?.find(img => img.showInCarousel);
          if (!image) return null;

          return (
            <div key={product._id || index}>
              <img src={image.url} alt={product.title} />
              <p className="legend">{product.title}</p>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
}
