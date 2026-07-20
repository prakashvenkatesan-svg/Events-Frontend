import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="MoneyPechu Events home">
          <img src="/assets/logo.png" alt="MoneyPechu Event Ticket Booking" />
        </Link>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav open" : "nav"}>
          <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
          <a href="/#events" onClick={() => setOpen(false)}>Events</a>
          <Link className="admin-button" to="/admin/login" onClick={() => setOpen(false)}>Admin Login</Link>
        </nav>
      </div>
    </header>
  );
}
