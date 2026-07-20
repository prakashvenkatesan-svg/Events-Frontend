import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  IndianRupee,
  TicketCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminEvents, bookings } from "./adminData";

const metrics = [
  ["Total Revenue", "₹3,76,400", IndianRupee, "+18.2%", "red"],
  ["Tickets Sold", "560", TicketCheck, "+12.5%", "green"],
  ["Total Bookings", "428", CreditCard, "+9.8%", "purple"],
  ["Checked In", "—", Users, "Event day", "gold"],
];
export default function DashboardPage() {
  return (
    <>
      <div className="admin-welcome">
        <div>
          <h2>Good morning, Admin 👋</h2>
          <p>Here’s what’s happening with your events today.</p>
        </div>
        <Link className="admin-primary" to="/admin/events/new">
          + Create New Event
        </Link>
      </div>
      <section className="metric-grid">
        {metrics.map(([label, value, Icon, change, color]) => (
          <article className="metric-card" key={label}>
            <div className={`metric-icon ${color}`}>
              <Icon />
            </div>
            <div>
              <span>{label}</span>
              <h3>{value}</h3>
              <small>
                <TrendingUp /> {change} <i>from last month</i>
              </small>
            </div>
          </article>
        ))}
      </section>
      <section className="admin-grid-main">
        <article className="admin-panel revenue-panel">
          <div className="panel-title">
            <div>
              <h3>Revenue Overview</h3>
              <p>Ticket sales during the last 7 days</p>
            </div>
            <select>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="bar-chart">
            {[45, 64, 50, 76, 68, 91, 82].map((height, i) => (
              <div key={i}>
                <span style={{ height: `${height}%` }}></span>
                <small>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </small>
              </div>
            ))}
          </div>
        </article>
        <article className="admin-panel sales-panel">
          <div className="panel-title">
            <div>
              <h3>Ticket Sales</h3>
              <p>By event</p>
            </div>
          </div>
          <div className="donut">
            <div>
              <b>560</b>
              <small>Sold</small>
            </div>
          </div>
          <ul>
            <li>
              <i className="green-dot" />
              Fans Meet <b>342</b>
            </li>
            <li>
              <i className="purple-dot" />
              Book Release <b>218</b>
            </li>
          </ul>
        </article>
      </section>
      <section className="admin-panel">
        <div className="panel-title">
          <div>
            <h3>Upcoming Events</h3>
            <p>Monitor sales and capacity</p>
          </div>
          <Link to="/admin/events">
            View All <ArrowRight />
          </Link>
        </div>
        <div className="upcoming-list">
          {adminEvents.slice(0, 2).map((event) => (
            <div key={event.id}>
              <img src={event.image} alt="" />
              <span>
                <b>{event.title}</b>
                <small>
                  <CalendarDays /> {event.date}
                </small>
              </span>
              <div className="capacity">
                <small>
                  {event.sold} / {event.capacity} tickets
                </small>
                <i>
                  <em
                    style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                  />
                </i>
              </div>
              <strong>{event.revenue}</strong>
              <Link to={`/admin/events/${event.id}/edit`}>Manage</Link>
            </div>
          ))}
        </div>
      </section>
      <section className="admin-panel">
        <div className="panel-title">
          <div>
            <h3>Recent Bookings</h3>
            <p>Latest registrations across all events</p>
          </div>
          <Link to="/admin/bookings">
            View All <ArrowRight />
          </Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 4).map((b) => (
                <tr key={b.id}>
                  <td>
                    <b>{b.id}</b>
                  </td>
                  <td>
                    <b>{b.name}</b>
                    <small>{b.email}</small>
                  </td>
                  <td>{b.event}</td>
                  <td>
                    <b>{b.amount}</b>
                  </td>
                  <td>
                    <span className={`table-status ${b.status.toLowerCase()}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
