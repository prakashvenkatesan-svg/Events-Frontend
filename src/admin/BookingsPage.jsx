import {
  Download,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { bookings } from "./adminData";

export default function BookingsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (status === "All" || b.status === status) &&
          `${b.name} ${b.email} ${b.id}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, status],
  );
  return (
    <>
      <section className="booking-summary-row">
        <div>
          <span>Total Bookings</span>
          <b>428</b>
        </div>
        <div>
          <span>Confirmed</span>
          <b className="green-text">401</b>
        </div>
        <div>
          <span>Submitted</span>
          <b className="gold-text">18</b>
        </div>
        <div>
          <span>Cancelled</span>
          <b className="red-text">9</b>
        </div>
      </section>
      <section className="admin-panel">
        <div className="table-toolbar">
          <div className="admin-search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or booking ID..."
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            <option>Confirmed</option>
            <option>Submitted</option>
            <option>Cancelled</option>
          </select>
          <select>
            <option>All Events</option>
            <option>Fans Meet</option>
            <option>Book Release</option>
          </select>
          <button className="admin-secondary">
            <Download /> Export CSV
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table wide">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Booking</th>
                <th>Attendee</th>
                <th>Event / Ticket</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <b>{b.id}</b>
                    <small>{b.date}</small>
                  </td>
                  <td>
                    <b>{b.name}</b>
                    <small>{b.email}</small>
                    <small>{b.phone}</small>
                  </td>
                  <td>
                    <b>{b.event}</b>
                    <small>{b.ticket}</small>
                  </td>
                  <td>{b.qty}</td>
                  <td>
                    <b>{b.amount}</b>
                  </td>
                  <td>
                    <span className={`table-status ${b.payment.toLowerCase()}`}>
                      {b.payment}
                    </span>
                  </td>
                  <td>
                    <span className={`table-status ${b.status.toLowerCase()}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <button className="icon-button">
                      <MoreHorizontal />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="empty-table">No bookings found.</div>
          )}
        </div>
        <div className="pagination">
          <span>Showing {rows.length} of 428 bookings</span>
          <div>
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>Next</button>
          </div>
        </div>
      </section>
    </>
  );
}
