// LandingPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import axios from "axios";
import "./LandingPage.css";

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [expandedId, setExpandedId] = useState(null); // NEW
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);

  const fadeTimer = useRef(null);
  const hoveringLegendRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      const prev = history.scrollRestoration;
      history.scrollRestoration = "manual";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return () => { history.scrollRestoration = prev; };
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    axios
      .get("/api/products/carousel")
      .then((res) => setProducts(res.data || []))
      .catch(console.error);
  }, []);

  const slides = useMemo(() => {
    return (products || [])
      .map((p) => ({
        product: p,
        image: p?.images?.find((img) => img?.showInCarousel),
        id: String(p?._id ?? p?.slug ?? Math.random()),
      }))
      .filter((s) => !!s.image);
  }, [products]);

  useEffect(() => {
    if (slides.length === 0) return;
    setIndex((i) => (i % slides.length + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const canRun = slides.length > 1 && !paused && !document.hidden;
    if (!canRun) return;

    intervalRef.current = setInterval(() => {
      setIndex((prev) => {
        if (slides.length <= 1) return prev;
        const next = (prev + 1) % slides.length;
        return next;
      });
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [slides.length, paused]);

  useEffect(() => {
    const onVis = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIndex((i) => i);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Cleanup fade timer on unmount
  useEffect(() => {
    return () => { if (fadeTimer.current) clearTimeout(fadeTimer.current); };
  }, []);

  const scheduleFade = (delay = 500) => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      if (!hoveringLegendRef.current) setActiveId(null);
    }, delay);
  };

  const ping = (id) => {
    const key = String(id ?? "");
    setActiveId(key);
    if (!hoveringLegendRef.current) scheduleFade(500);
  };

  // collapse expanded when slide changes
  useEffect(() => {
    setExpandedId(null);
  }, [index]);

  return (
    <div className="carousel-wrapper">
      <Carousel
        selectedItem={index}
        onChange={(i) => setIndex(i)}
        autoPlay={false}
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        showArrows
        stopOnHover={false}
        interval={4000}
        transitionTime={700}
        emulateTouch
        swipeable
      >
        {slides.map(({ product, image, id }) => (
          <div
            key={id}
            className="carousel-slide"
            onMouseMove={() => ping(id)}
            onMouseLeave={() => {
              hoveringLegendRef.current = false;
              setPaused(false);
              setExpandedId(null);
              setActiveId(null);
            }}
            onTouchStart={() => {
              ping(id);
              hoveringLegendRef.current = true;
              setPaused(true);
              setExpandedId(id);
            }}
            onTouchEnd={() => {
              hoveringLegendRef.current = false;
              setPaused(false);
              scheduleFade(400);
            }}
          >
            <img src={image.url} alt={product.title} onMouseMove={() => ping(id)} />

            {/* Legend now acts like a button/panel, not a link */}
            <div
              role="button"
              tabIndex={0}
              className={`custom-legend ${activeId === id ? "visible" : ""} ${expandedId === id ? "expanded" : ""}`}
              onMouseEnter={() => {
                hoveringLegendRef.current = true;
                setPaused(true);
                setActiveId(id);
                setExpandedId(id);
                if (fadeTimer.current) clearTimeout(fadeTimer.current);
              }}
              onMouseLeave={() => {
                hoveringLegendRef.current = false;
                setPaused(false);
                setExpandedId(null);
                scheduleFade(500);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                hoveringLegendRef.current = true;
                setPaused(true);
                setActiveId(id);
                setExpandedId((x) => (x === id ? null : id));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  hoveringLegendRef.current = true;
                  setPaused(true);
                  setActiveId(id);
                  setExpandedId((x) => (x === id ? null : id));
                }
              }}
            >
              <div className="legend-title">{product.title}</div>

              {expandedId === id && (
                <div className="legend-body" onClick={(e) => e.stopPropagation()}>
                  <p className="legend-desc">
                    {product.description?.trim() || "No description available."}
                  </p>
                  <a
                    href={`/product/${product.slug}`}
                    className="legend-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View product →
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
