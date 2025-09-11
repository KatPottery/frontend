import "./Footer.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Footer() {

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");  

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus(""); 

    try {
      const res = await axios.post("/api/subscribe", { email });
      if (res.data.success) {
        setStatus("Subscribed!");
        setEmail("");
      }
    } catch (err) {
      console.error(err);
      setStatus("Subscription failed. Try again.");
    }
  };


  return (
    <footer className="footer">
      <div className="footer-columns">
        <div className="footer-col">
          <h3>ABOUT US</h3>
          <p>
            Welcome to Kats Pottery and Art shop!
          </p>
          <p><strong>Stay Connected!</strong></p>
          <br/>
          <div className="social-links">
            <a href="https://www.instagram.com/tobeaflower.kat/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>

        <div className="footer-col">
          <h3>COLLECTIONS</h3>
          <ul>
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/catalog">Catalog</Link></li>
            <li><Link to="/shop?tag=pottery">Pottery</Link></li>
            <li><Link to="/shop?tag=painting">Painting</Link></li>
            <li><Link to="/shop?tag=drawing">Drawing</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>CONTACT US</h3>
          <ul>
            <li><Link to="/contact">Contact Form</Link></li>
            <li><Link to="/faq">FAQ & Terms</Link></li>
            <li><a href="mailto:alicia.zhao1@gmail.com">Email Us</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>MAILING LIST</h3>
          <p>
            Subscribe to get shop updates, new pottery, art and news.
          </p>
          <form className="subscribe-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">SUBSCRIBE</button>
          </form>
          {status && <p className="subscribe-status">{status}</p>}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Kat Pottery and Art. All rights reserved.</p>
        <div className="legal-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
