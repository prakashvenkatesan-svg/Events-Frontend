import {
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Settings,
  TicketCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const nav = [
  ["/admin", LayoutDashboard, "Dashboard", true],
  ["/admin/events", CalendarDays, "Events"],
  ["/admin/bookings", TicketCheck, "Bookings"],
  ["/admin/check-in", QrCode, "Check-In"],
  ["/admin/payments", CreditCard, "Payments"],
  ["/admin/clients", Users, "Client List"],
  ["/admin/settings", Settings, "Settings"],
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title = location.pathname.includes("events/new")
    ? "Create Event"
    : location.pathname.includes("/edit")
      ? "Edit Event"
      : nav.find(([path, , , exact]) =>
          exact
            ? location.pathname === path
            : location.pathname.startsWith(path),
        )?.[2] || "Dashboard";
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-brand">
          <img src="/assets/logo.png" alt="MoneyPechu" />
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <nav>
          {nav.map(([path, Icon, label, exact]) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              onClick={() => setOpen(false)}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
        {/* <div className="sidebar-help">
          <BarChart3 />
          <b>Need assistance?</b>
          <small>Contact platform support</small>
          <button>Get Support</button>
        </div> */}
        <NavLink className="logout" to="/">
          <LogOut /> View Public Site
        </NavLink>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <small>Organizer Portal</small>
            <h1>{title}</h1>
          </div>
          <div className="admin-user">
            <span>
              <b>MoneyPechu Admin</b>
              <small>Super Admin</small>
            </span>
            <i>
              <UserRound />
            </i>
          </div>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
