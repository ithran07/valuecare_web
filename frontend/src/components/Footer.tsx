import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Clock3,
  Facebook,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import "../style/footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">

      <div className="container">

        {/* TOP */}

        <div className="site-footer-top">

          <div className="site-footer-brand">

            <Link
              to="/"
              className="site-footer-logo"
            >
              Value<span>Care</span>
            </Link>

            <p>
              Reliable medical and healthcare supplies for
              clinics, hospitals, pharmacies, and healthcare
              professionals.
            </p>

            <a
              href="#"
              className="site-footer-social"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>

          </div>


          {/* SHOP */}

          <div className="site-footer-column">

            <h4>Shop</h4>

            <Link to="/products">
              All products
            </Link>

            <Link to="/track-order">
              Track an order
            </Link>

            <Link to="/cart">
              Shopping cart
            </Link>

            <Link to="/account">
              My account
            </Link>

          </div>


          {/* COMPANY */}

          <div className="site-footer-column">

            <h4>Company</h4>

            <Link to="/about">
              About ValueCare
            </Link>

            <Link to="/contact">
              Contact us
            </Link>

            <Link to="/products">
              Product catalog
            </Link>

          </div>


          {/* CONTACT */}

          <div className="site-footer-column site-footer-contact">

            <h4>Get in touch</h4>

            <div className="site-footer-contact-item">
              <MapPin size={15} />

              <span>
                Office #211, Waterside Living Complex 
                Julio Pacana St., 
                Cagayan de Oro City,
                Misamis Oriental, Philippines
              </span>
            </div>

            <div className="site-footer-contact-item">
              <Phone size={15} />

              <span>
                +63 917 326 4998
              </span>
            </div>

            <div className="site-footer-contact-item">
              <Mail size={15} />

              <span>
                valuecaremedsupplies@gmail.com
              </span>
            </div>

            <div className="site-footer-contact-item">
              <Clock3 size={15} />

              <span>
                Sun–Fri, 9:00 AM – 3:00 PM
              </span>
            </div>

          </div>

        </div>


        {/* ORDER MESSAGE */}

        <div className="site-footer-order-note">

          <div className="site-footer-order-icon">
            <ArrowUpRight size={17} />
          </div>

          <div>
            <strong>
              Need a larger or recurring supply order?
            </strong>

            <span>
              Contact our team for assistance with product
              availability, quantities, and delivery arrangements.
            </span>
          </div>

          <Link to="/contact">
            Talk to us
            <ArrowUpRight size={15} />
          </Link>

        </div>


        {/* BOTTOM */}

        <div className="site-footer-bottom">

          <span>
            © {year} ValueCare Medical Supplies.
            All rights reserved.
          </span>

          <div className="site-footer-bottom-links">

            <span>
              Orders are confirmed before payment.
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}