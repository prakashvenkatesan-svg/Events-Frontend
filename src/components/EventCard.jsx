import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <article className="event-card">
      <Link to={`/events/${event.id}`} className="card-image-wrap">
        <img src={event.banner} alt={event.title} />
        <span className={`category ${event.theme}`}>{event.category}</span>
      </Link>
      <div className="event-card-body">
        <h3><Link to={`/events/${event.id}`}>{event.cardTitle}</Link></h3>
        <p><CalendarDays /> {event.date}</p>
        <p><Clock3 /> {event.time}</p>
        <p><MapPin /> <span>{event.venue}, {event.address}</span></p>
        <div className="price-row"><span>Starts From Just</span><strong>₹ {event.price}</strong></div>
      </div>
    </article>
  );
}
