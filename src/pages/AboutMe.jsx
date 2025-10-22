import React from "react";
import "./AboutMe.css";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-grid">
          <div className="about-photo">
            <img
              src="/images/portrait.jpg"
              alt="portrait"
              loading="lazy"
            />
          </div>

          <div className="about-content">
            <h2>Biography</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              dictum diam vitae arcu accumsan, sit amet euismod nunc tincidunt.
              Proin at elit vel ligula facilisis egestas. Vivamus ac mi vitae
              elit ultricies bibendum ut sit amet ipsum. Vestibulum ante ipsum
              primis in faucibus orci luctus et ultrices posuere cubilia curae;
              In iaculis, nibh sed laoreet bibendum, est orci malesuada orci,
              id tempor mauris arcu et massa.
            </p>

            <h3>Education</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
              ac varius justo. Suspendisse potenti. Nulla facilisi. Mauris
              tempus sem nec justo gravida, sit amet aliquet urna bibendum.
            </p>

            <h3>Residency</h3>
            <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
              <li>Aliquam laoreet mi et justo accumsan consequat.</li>
              <li>Donec ullamcorper magna in libero pretium.</li>
            </ul>

            <h3>Exhibitions</h3>
            <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
              <li>Praesent sit amet arcu nec magna elementum bibendum.</li>
              <li>Curabitur facilisis nunc ac diam luctus.</li>
            </ul>
            <p className="about-link-row">
              <Link to="/gallery" className="about-link">
                View Gallery →
              </Link>
            </p>

            <h3>Collections</h3>
            <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
              <li>Sed hendrerit ligula at justo viverra.</li>
            </ul>
            <p className="about-link-row">
              <Link to="/gallery" className="about-link">
                Explore Collection →
              </Link>
            </p>
          </div>
        </div>

        <div className="about-footer">
          <form
            className="about-subscribe"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks for subscribing!");
            }}
          >
            <label htmlFor="about-subscribe-email" className="about-subscribe-label">
              Subscribe:
            </label>
            <input
              id="about-subscribe-email"
              type="email"
              placeholder="Enter your email address"
              required
            />
            <button type="submit">Join</button>
          </form>

          <div className="about-contact">
            <p>
              Follow:{" "}
              <a href="https://instagram.com/" target="_blank" rel="noreferrer">
                @potteryshop
              </a>
            </p>
            <p>
              Email:{" "}
              <a href="mailto:hello@potteryshop.com">hello@potteryshop.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
