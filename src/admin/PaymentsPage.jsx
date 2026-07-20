import { Download, IndianRupee } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/admin/payments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch payments");
      }

      setPayments(data.payments || []);
    } catch (error) {
      console.error("Fetch payments error:", error);

      setError(error.message || "Unable to load payment transaction details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
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
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus === "success") {
      return "paid";
    }

    if (normalizedStatus === "pending" || normalizedStatus === "initiated") {
      return "pending-approval";
    }

    if (normalizedStatus === "failed" || normalizedStatus === "failure") {
      return "failed";
    }

    return normalizedStatus.replaceAll("_", "-");
  };

  const getStatusText = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    if (normalizedStatus === "SUCCESS") {
      return "Success";
    }

    if (normalizedStatus === "INITIATED") {
      return "Initiated";
    }

    if (normalizedStatus === "FAILED") {
      return "Failed";
    }

    return status || "Unknown";
  };

  const exportReport = () => {
    if (payments.length === 0) {
      alert("No payment data available to export.");
      return;
    }

    const headers = [
      "Client Name",
      "Event",
      "Amount",
      "Date",
      "Transaction ID",
      "Status",
    ];

    const rows = payments.map((payment) => [
      payment.clientName || "",
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

    const csvBlob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

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
      <section className='metric-grid payment-metrics'>
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
      </section>

      <section className='admin-panel'>
        <div className='payment-tabs'>
          <div>
            <h2>Payment Transactions</h2>
          </div>

          <button
            type='button'
            className='admin-secondary'
            onClick={exportReport}
          >
            <Download />
            Export Report
          </button>
        </div>

        {error && (
          <div className='admin-error'>
            <p>{error}</p>

            <button type='button' onClick={fetchPayments}>
              Try Again
            </button>
          </div>
        )}

        <div className='admin-table-wrap'>
          <table className='admin-table wide'>
            <thead>
              <tr>
                <th>Client Name</th>
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
                  <td colSpan='6' className='table-empty'>
                    Loading payment transactions...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan='6' className='table-empty'>
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id || payment.transactionId}>
                    <td>
                      <b>{payment.clientName || "—"}</b>
                    </td>

                    <td>{payment.event || "—"}</td>

                    <td>
                      <b>{formatAmount(payment.amount)}</b>
                    </td>

                    <td>{formatDate(payment.date)}</td>

                    <td>
                      <b>{payment.transactionId || "—"}</b>
                    </td>

                    <td>
                      <span
                        className={`table-status ${getStatusClass(
                          payment.status,
                        )}`}
                      >
                        {getStatusText(payment.status)}
                      </span>
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
