import {
  Accessibility,
  CalendarDays,
  Car,
  Check,
  Clock3,
  Coffee,
  MapPin,
  ShieldCheck,
  Snowflake,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import BookingPanel from "../components/BookingPanel";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { events } from "../data/events";

const features = [
  [Snowflake, "Air Conditioned Hall"],
  [Car, "Parking Available"],
  [Coffee, "Refreshments"],
  [Accessibility, "Wheelchair Access"],
  [ShieldCheck, "Safe & Secure"],
  [UtensilsCrossed, "Food Counters"],
];

function Checklist({ items }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>
          <Check />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function EventPage() {
  const { eventId } = useParams();
  const event = events[eventId];
  if (!event) return <Navigate to="/" replace />;
  return (
    <>
      <Header />
      <main className="event-page">
        <section className="event-banner container">
          <img src={event.banner} alt={event.title} />
        </section>
        <div className="container details-layout">
          <div className="details-content">
            <section className="content-card intro-card">
              <span className={`category ${event.theme}`}>
                {event.category}
              </span>
              <h1>{event.title}</h1>
              <div className="event-meta">
                <span>
                  <CalendarDays />
                  {event.date}
                </span>
                <span>
                  <Clock3 />
                  {event.time}
                </span>
                <span>
                  <MapPin />
                  {event.venue}, {event.address}
                </span>
              </div>
            </section>
            <section className="content-card">
              <h2>About the Event</h2>
              <p>{event.about}</p>
              <div className="host">
                <img src="/assets/host.png" alt="Mr. Anand Srinivasan" />
                <div>
                  <small>Hosted by</small>
                  <h3>Mr. Anand Srinivasan</h3>
                  <p>Financial educator & founder of MoneyPechu</p>
                </div>
              </div>
            </section>
            <section className={`event-facts ${event.theme}`}>
              <div>
                <CalendarDays />
                <span>
                  <small>Date</small>
                  <b>{event.date}</b>
                </span>
              </div>
              <div>
                <Clock3 />
                <span>
                  <small>Time</small>
                  <b>{event.time}</b>
                </span>
              </div>
              <div>
                <MapPin />
                <span>
                  <small>Venue</small>
                  <b>{event.venue}</b>
                </span>
              </div>
            </section>
            <section className="content-card two-column">
              <div>
                <h2>Why Attend?</h2>
                <Checklist items={event.whyAttend} />
              </div>
              <div>
                <h2>Who Should Attend?</h2>
                <Checklist items={event.audience} />
              </div>
            </section>
            <section className="content-card">
              <h2>Event Comforts & Features</h2>
              <p className="muted">
                Everything you need for a comfortable experience.
              </p>
              <div className="feature-grid">
                {features.map(([Icon, label]) => (
                  <div key={label}>
                    <Icon />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="content-card location-card">
              <div>
                <h2>Event Location</h2>
                <h3>{event.venue}</h3>
                <p>
                  <MapPin /> {event.address}
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Google Maps →
                </a>
              </div>
              <div className="map-art">
                <span className="road r1" />
                <span className="road r2" />
                <span className="road r3" />
                <MapPin />
              </div>
            </section>
            <section className="content-card">
              <h2>Things to Know</h2>
              <div className="terms">
                <h3>Terms & Conditions</h3>
                <ol>
                  <li>
                    <b>Registration:</b> Attendees must pre-register and carry
                    their ticket for entry.
                  </li>
                  <li>
                    <b>Confidentiality:</b> Event content may not be reproduced
                    without permission.
                  </li>
                  <li>
                    <b>No Investment Advice:</b> Information shared is
                    educational and not financial advice.
                  </li>
                  <li>
                    <b>Liability Disclaimer:</b> The organizer is not
                    responsible for individual investment decisions.
                  </li>
                </ol>
                <h3>Cancellation & Refunds</h3>
                <ol>
                  <li>No refunds are applicable for attendee cancellations.</li>
                  <li>No refund is provided for missed events.</li>
                  <li>
                    If the event is cancelled or postponed, registered attendees
                    will be notified by email.
                  </li>
                </ol>
              </div>
            </section>
          </div>
          <BookingPanel event={event} />
        </div>
      </main>
      <Footer />
    </>
  );
}
