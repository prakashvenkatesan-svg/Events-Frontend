import { Download, IndianRupee, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "https://33qrojuqfde2na3a6gvel5k53m0muxal.lambda-url.ap-south-1.on.aws").replace(/\/$/, "");

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [headerEl, setHeaderEl] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const limit = 30;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [eventsList, setEventsList] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/api/events`);
        const data = await response.json();
        if (data.events) {
          setEventsList(data.events);
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams({
        page,
        limit,
      });

      if (searchQuery) queryParams.append("search", searchQuery);
      if (statusFilter) queryParams.append("status", statusFilter);
      if (eventFilter) queryParams.append("event_id", eventFilter);
      if (fromDate) queryParams.append("from_date", fromDate);
      if (toDate) queryParams.append("to_date", toDate);

      const response = await fetch(`${API_URL}/api/admin/payments?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch payments");
      }

      setPayments(data.payments || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error("Fetch payments error:", error);
      setError(error.message || "Unable to load payment transaction details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, searchQuery, statusFilter, eventFilter, fromDate, toDate]);

  useEffect(() => {
    setHeaderEl(document.getElementById("admin-header-title"));
  }, []);

  const successfulPayments = useMemo(() => {
    return payments.filter(
      (payment) => String(payment.status || "").toUpperCase() === "SUCCESS",
    );
  }, [payments]);

  const grossRevenue = useMemo(() => {
    return successfulPayments.reduce((total, payment) => {
      return total + Number(payment.amount || 0);
    }, 0);
  }, [successfulPayments]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();
    if (normalizedStatus === "success") return "paid";
    if (normalizedStatus === "pending" || normalizedStatus === "initiated") return "pending-approval";
    if (normalizedStatus === "failed" || normalizedStatus === "failure") return "failed";
    return normalizedStatus.replaceAll("_", "-");
  };

  const getStatusText = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();
    if (normalizedStatus === "SUCCESS") return "Success";
    if (normalizedStatus === "INITIATED") return "Initiated";
    if (normalizedStatus === "FAILED") return "Failed";
    return status || "Unknown";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("");
    setEventFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const exportReport = () => {
    if (payments.length === 0) {
      alert("No payment data available to export.");
      return;
    }
    const headers = [
      "Client Name", "Booking ID", "Mobile Number", "Email Address", 
      "Event", "Amount", "Date", "Transaction ID", "Status",
    ];
    const rows = payments.map((payment) => [
      payment.clientName || "",
      payment.bookingId || "",
      payment.mobileNumber || "",
      payment.emailAddress || "",
      payment.event || "",
      payment.amount || "0",
      formatDate(payment.date),
      payment.transactionId || "",
      payment.status || "",
    ]);
    const escapeCsvValue = (value) => {
      const stringValue = String(value ?? "").replace(/"/g, '""');
      return `"${stringValue}"`;
    };
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "payment-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <>
      {headerEl &&
        createPortal(
          <section className='metric-grid payment-metrics' style={{ marginBottom: 0 }}>
            <article className='metric-card'>
              <div className='metric-icon green'>
                <IndianRupee />
              </div>
              <div>
                <span>Total Amount</span>
                <h3>{formatAmount(grossRevenue)}</h3>
                <small>{successfulPayments.length} successful transactions</small>
              </div>
            </article>
          </section>,
          headerEl,
        )}

      <section className='admin-panel' style={{ padding: '12px 22px' }}>
        <div className='payment-tabs' style={{ marginBottom: '10px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Payment Transactions</h3>
          </div>
          <button type='button' className='admin-secondary' onClick={exportReport}>
            <Download />
            Export Report
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className='admin-toolbar' style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
            <input 
              type="text" 
              placeholder="Search by name, email, mobile, txnid..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '250px' }}
            />
            <button type="submit" className="admin-secondary" style={{ padding: '8px 12px' }}>
              <Search size={16} />
            </button>
          </form>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="INITIATED">Initiated</option>
            <option value="FAILED">Failed</option>
          </select>

          <select value={eventFilter} onChange={(e) => { setEventFilter(e.target.value); setPage(1); }} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', maxWidth: '200px' }}>
            <option value="">All Events</option>
            {eventsList.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>

          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} title="From Date" />
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} title="To Date" />

          <button type="button" onClick={clearFilters} className="admin-secondary" style={{ padding: '8px 12px' }}>
            Clear Filters
          </button>
        </div>

        {error && (
          <div className='admin-error'>
            <p>{error}</p>
            <button type='button' onClick={fetchPayments}>Try Again</button>
          </div>
        )}

        <div className='admin-table-wrap'>
          <table className='admin-table wide'>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Booking ID</th>
                <th>Mobile Number</th>
                <th>Email Address</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan='9' className='table-empty'>Loading payment transactions...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan='9' className='table-empty'>No payment transactions found.</td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id || payment.transactionId}>
                    <td><b>{payment.clientName || "—"}</b></td>
                    <td>{payment.bookingId || "—"}</td>
                    <td>{payment.mobileNumber || "—"}</td>
                    <td>{payment.emailAddress || "—"}</td>
                    <td>{payment.event || "—"}</td>
                    <td><b>{formatAmount(payment.amount)}</b></td>
                    <td>{formatDate(payment.date)}</td>
                    <td><b>{payment.transactionId || "—"}</b></td>
                    <td>
                      <span className={`table-status ${getStatusClass(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Showing {payments.length} of {totalCount} transactions (Page {page} of {totalPages})
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                disabled={page <= 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="admin-secondary"
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button 
                type="button" 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="admin-secondary"
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
