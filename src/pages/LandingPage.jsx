import {
  ArrowRight,
  CalendarCheck,
  Search,
  ShieldCheck,
  TicketCheck,
} from "lucide-react";
import { useState } from "react";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { eventList } from "../data/events";

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const filtered = eventList.filter((event) =>
    event.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="container hero-content">
            <span className="eyebrow">Learn · Connect · Experience</span>
            <h1>
              Make time for
              <br />
              <em>what matters.</em>
            </h1>
            <p>Find your next unforgettable moment.</p>
            <div className="hero-search">
              <Search />
              <input
                aria-label="Search events"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events..."
              />
              <a href="#events">
                Explore Events <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>
        <section className="events-section" id="events">
          <div className="container">
            <div className="section-heading">
              <span>DON'T MISS OUT</span>
              <h2>Upcoming Popular Events</h2>
              <p>
                Discover experiences designed to inspire, educate and bring
                people together.
              </p>
            </div>
            <div className="event-grid">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              <article className="event-card coming-soon">
                <div>
                  <CalendarCheck />
                  <h3>
                    More Events
                    <br />
                    Will Feature Soon
                  </h3>
                  <p>Stay tuned for new experiences.</p>
                </div>
              </article>
            </div>
            {!filtered.length && (
              <p className="empty">No events match “{query}”.</p>
            )}
          </div>
        </section>
        <section className="trust-strip">
          <div className="container trust-grid">
            <div>
              <TicketCheck />
              <span>
                <b>Easy Booking</b>
                <small>Reserve your seat in minutes</small>
              </span>
            </div>
            <div>
              <ShieldCheck />
              <span>
                <b>Secure Checkout</b>
                <small>Your details stay protected</small>
              </span>
            </div>
            <div>
              <CalendarCheck />
              <span>
                <b>Instant Confirmation</b>
                <small>Your e-ticket, right away</small>
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
