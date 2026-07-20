import {
  CalendarDays,
  Copy,
  Edit3,
  Eye,
  MoreVertical,
  Plus,
  Search,
  TicketCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminEvents } from "./adminData";

export default function EventsPage() {
  return (
    <>
      <div className="admin-actions">
        <div className="admin-search">
          <Search />
          <input placeholder="Search events..." />
        </div>
        <select>
          <option>All Status</option>
          <option>Published</option>
          <option>Draft</option>
        </select>
        <Link className="admin-primary" to="/admin/events/new">
          <Plus /> Create Event
        </Link>
      </div>
      <div className="event-admin-grid">
        {adminEvents.map((event) => (
          <article className="admin-event-card" key={event.id}>
            <div className="admin-event-image">
              <img src={event.image} alt={event.title} />
              <span className={`table-status ${event.status.toLowerCase()}`}>
                {event.status}
              </span>
              <button>
                <MoreVertical />
              </button>
            </div>
            <div className="admin-event-body">
              <h3>{event.title}</h3>
              <p>
                <CalendarDays /> {event.date}
              </p>
              <div className="admin-event-stats">
                <span>
                  <small>Tickets Sold</small>
                  <b>
                    {event.sold} / {event.capacity}
                  </b>
                </span>
                <span>
                  <small>Revenue</small>
                  <b>{event.revenue}</b>
                </span>
              </div>
              <div className="capacity">
                <i>
                  <em
                    style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                  />
                </i>
              </div>
              <div className="event-card-actions">
                <Link to={`/events/${event.id}`}>
                  <Eye /> Preview
                </Link>
                <Link to={`/admin/events/${event.id}/edit`}>
                  <Edit3 /> Edit
                </Link>
                <button>
                  <Copy />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
