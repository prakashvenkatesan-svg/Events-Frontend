import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  Clock3,
  Download,
  Home,
  MapPin,
  Mail,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import { Link, useParams, useSearchParams } from "react-router-dom";

import Header from "../components/Header";
import { events } from "../data/events";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

function formatEventDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatEventTime(value) {
  if (!value) {
    return "";
  }

  const [hours, minutes] = String(value).split(":");

  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function ConfirmationPage() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   This is only used for frontend styles,
   category, theme and banner information.
  */
  const frontendEvent = events[eventId] || null;

  useEffect(() => {
    let cancelled = false;

    const loadTicket = async () => {
      if (!token) {
        setError("Ticket token is missing. Please contact support.");

        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/tickets/${encodeURIComponent(token)}`,
        );

        const contentType = response.headers.get("content-type") || "";

        const result = contentType.includes("application/json")
          ? await response.json()
          : {
              message: await response.text(),
            };

        if (!response.ok) {
          throw new Error(result.message || "Unable to retrieve your ticket.");
        }

        if (!cancelled) {
          setTicket(result.ticket);
        }
      } catch (requestError) {
        console.error("Ticket loading error:", requestError);

        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to retrieve your ticket.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTicket();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const ticketDisplay = useMemo(() => {
    if (!ticket) {
      return null;
    }

    const date = frontendEvent?.date || formatEventDate(ticket.event_date);

    const startTime = formatEventTime(ticket.start_time);

    const endTime = formatEventTime(ticket.end_time);

    const time =
      frontendEvent?.time || [startTime, endTime].filter(Boolean).join(" TO ");

    return {
      title: frontendEvent?.title || ticket.event_title || "MoneyPechu Event",

      category: frontendEvent?.category || "MoneyPechu Event",

      date,

      time,

      venue: ticket.location || frontendEvent?.venue || "",

      theme: frontendEvent?.theme || "green",

      name: ticket.full_name,

      email: ticket.email,

      ticketCode: ticket.ticket_code,

      bookingCode: ticket.booking_code,

      amount: Number(ticket.total_amount || 0).toLocaleString("en-IN"),

      status: ticket.ticket_status,

      transactionId: ticket.txn_id,

      paymentStatus: ticket.payment_status,
    };
  }, [ticket, frontendEvent]);

  const qrValue = useMemo(() => {
    if (!token) {
      return "";
    }

    /*
     The QR contains only a secure verification URL.
     It does not contain name, email, mobile or payment data.
    */
    return (
      ticket?.verificationUrl ||
      `${window.location.origin}/verify-ticket/${token}`
    );
  }, [ticket, token]);

  const downloadTicket = () => {
    window.print();
  };

  if (loading) {
    return (
      <>
        <Header />

        <main className='confirmation-page'>
          <section className='success'>
            <h1>Preparing Your Ticket...</h1>

            <p>Payment received. Your ticket is being loaded.</p>
          </section>
        </main>
      </>
    );
  }

  if (error || !ticketDisplay) {
    return (
      <>
        <Header />

        <main className='confirmation-page'>
          <section className='success ticket-error'>
            <h1>Ticket Unavailable</h1>

            <p>{error || "Unable to retrieve your ticket."}</p>

            <Link className='secondary-button' to='/'>
              <Home />
              Back to Home
            </Link>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className='confirmation-page'>
        <section className='success'>
          <span>
            <Check />
          </span>

          <h1>Booking Confirmed!</h1>

          <p>
            Your payment was completed successfully. Your ticket number is{" "}
            <b>{ticketDisplay.ticketCode}</b>.
          </p>
        </section>

        <section className={`ticket ${ticketDisplay.theme}`}>
          <div className='ticket-main'>
            <div className='ticket-top'>
              <img src='/assets/logo.png' alt='MoneyPechu' />

              <span>
                {ticketDisplay.status === "VALID"
                  ? "ADMIT ONE"
                  : ticketDisplay.status}
              </span>
            </div>

            <div className='ticket-title'>
              <small>{ticketDisplay.category}</small>

              <h2>{ticketDisplay.title}</h2>
            </div>

            <div className='ticket-details'>
              <p>
                <CalendarDays />

                <span>
                  <small>Date</small>
                  <b>{ticketDisplay.date}</b>
                </span>
              </p>

              <p>
                <Clock3 />

                <span>
                  <small>Time</small>
                  <b>{ticketDisplay.time}</b>
                </span>
              </p>

              <p>
                <MapPin />

                <span>
                  <small>Venue</small>
                  <b>{ticketDisplay.venue}</b>
                </span>
              </p>
            </div>

            <div className='attendee'>
              <span>
                <small>Attendee</small>
                <b>{ticketDisplay.name}</b>
              </span>

              <span>
                <small>Booking ID</small>
                <b>{ticketDisplay.bookingCode}</b>
              </span>

              <span>
                <small>Ticket ID</small>
                <b>{ticketDisplay.ticketCode}</b>
              </span>

              <span>
                <small>Ticket</small>
                <b>General Admission</b>
              </span>

              <span>
                <small>Amount Paid</small>
                <b>₹ {ticketDisplay.amount}</b>
              </span>

              <span>
                <small>Payment Status</small>
                <b>{ticketDisplay.paymentStatus}</b>
              </span>
            </div>
          </div>

          <div className='ticket-stub'>
            {qrValue && (
              <QRCodeSVG value={qrValue} size={150} level='H' includeMargin />
            )}

            <b>SCAN AT ENTRY</b>

            <small>Do not share this QR code</small>

            <small>{ticketDisplay.ticketCode}</small>
          </div>
        </section>

        <div className='confirmation-actions'>
          <button
            type='button'
            className='primary-button'
            onClick={downloadTicket}
          >
            <Download />
            Download Ticket
          </button>

          {/* {ticketDisplay.email && (
            <a
              className='secondary-button'
              href={`mailto:${ticketDisplay.email}?subject=${encodeURIComponent(
                `Your MoneyPechu Ticket - ${ticketDisplay.ticketCode}`,
              )}`}
            >
              <Mail />
              Email Ticket
            </a>
          )} */}

          <Link className='secondary-button' to='/'>
            <Home />
            Back to Home
          </Link>
        </div>

        <p className='help-text'>
          Need help? Contact us at <b>events@moneypechu.com</b>
        </p>
      </main>
    </>
  );
}
