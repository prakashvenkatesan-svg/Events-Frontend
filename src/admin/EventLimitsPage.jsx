import { CalendarDays, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "https://33qrojuqfde2na3a6gvel5k53m0muxal.lambda-url.ap-south-1.on.aws").replace(/\/$/, "");

export default function EventLimitsPage() {
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLimits = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/event-limits`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch event limits");
      setLimits(data.limits || []);
    } catch (error) {
      console.error("Fetch limits error:", error);
      setError(error.message || "Unable to load event limits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const togglePause = async (eventId, isPaused) => {
    if (!confirm(`Are you sure you want to ${isPaused ? 'pause' : 'resume'} ticket bookings for this event?`)) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/event-limits/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ eventId, isPaused })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update event pause status.");
      fetchLimits(); // refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className='client-banner'>
        <div>
          <span><CalendarDays /></span>
          <div><h2>Event Filing Limits</h2></div>
        </div>
        <b>{limits.length}<small>Total Events</small></b>
      </div>

      <section className='admin-panel'>
        <div className='panel-title' style={{ marginBottom: '20px' }}>
          <div>
            <h3>Event Capacity & Booking Controls</h3>
            <p>Monitor event ticket sales against targets and manually pause/resume bookings to prevent overbooking.</p>
          </div>
        </div>

        {error && (
          <div className='admin-error' style={{ marginBottom: '20px' }}><p>{error}</p></div>
        )}

        <div className='admin-table-wrap'>
          <table className='admin-table wide'>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>Current Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan='4' className='table-empty'>Loading event limits...</td></tr>
              ) : limits.length === 0 ? (
                <tr><td colSpan='4' className='table-empty'>No events found in the database.</td></tr>
              ) : (
                limits.map((event) => (
                  <tr key={event.id}>
                    <td><b>{event.title || "Unnamed Event"}</b></td>
                    <td>{formatDate(event.date)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{event.tickets_sold || 0} / {event.target_count || 200}</span>
                        {event.is_paused ? (
                          <span className="table-status failed">Paused</span>
                        ) : (
                          <span className="table-status success">Active</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type='button'
                          className={`admin-secondary`}
                          style={{ padding: '4px 8px', fontSize: '12px', background: event.is_paused ? '#10b981' : '#ef4444', color: 'white', borderColor: 'transparent' }}
                          onClick={() => togglePause(event.id, !event.is_paused)}
                        >
                          {event.is_paused ? 'Resume Bookings' : 'Pause Bookings'}
                        </button>
                        <button type='button' className='icon-button' aria-label={`Actions for ${event.title}`}>
                          <MoreHorizontal />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
