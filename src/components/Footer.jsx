import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <img className="footer-logo" src="/assets/logo.png" alt="MoneyPechu" />
          <p>Discover meaningful conferences, workshops and experiences that help you learn, connect and grow.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link to="/">Home</Link><a href="/#events">Upcoming Events</a><Link to="/admin/login">Admin Login</Link>
        </div>
        <div>
          <h3>Contact Us</h3>
          <p><MapPin size={17} /> Chennai, Tamil Nadu</p>
          <p><Mail size={17} /> events@moneypechu.com</p>
          <p><Phone size={17} /> +91 98765 43210</p>
        </div>
        <div>
          <h3>Follow Us</h3>
          <div className="socials"><a href="#" aria-label="Instagram"><Instagram /></a><a href="#" aria-label="Facebook"><Facebook /></a></div>
        </div>
      </div>
      <div className="copyright">© 2026 MoneyPechu Events. All rights reserved.</div>
    </footer>
  );
}
