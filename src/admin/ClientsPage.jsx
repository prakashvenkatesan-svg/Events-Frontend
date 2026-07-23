import { Download, MoreHorizontal, Plus, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "https://33qrojuqfde2na3a6gvel5k53m0muxal.lambda-url.ap-south-1.on.aws").replace(/\/$/, "");

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [eventsList, setEventsList] = useState([]);
  
  // Modal form state
  const [formData, setFormData] = useState({
    fullName: "", mobile: "", email: "", eventName: "", quantity: 1, amount: "", paymentStatus: "SUCCESS", transactionId: "", remarks: ""
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/clients`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch clients");
      setClients(data.clients || []);
    } catch (error) {
      console.error("Fetch clients error:", error);
      setError(error.message || "Unable to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      const data = await response.json();
      if (data.events) setEventsList(data.events);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const filteredClients = useMemo(() => {
    const searchText = query.trim().toLowerCase();
    if (!searchText) return clients;
    return clients.filter((client) => {
      const searchableText = `${client.name || ""} ${client.email || ""} ${client.phone || ""}`.toLowerCase();
      return searchableText.includes(searchText);
    });
  }, [clients, query]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const exportClientsCsv = () => {
    if (clients.length === 0) {
      alert("No client data available to export.");
      return;
    }
    const headers = ["Name", "Email", "Mobile", "Added On"];
    const rows = clients.map((client) => [
      client.name || "", client.email || "", client.phone || "", formatDate(client.createdAt),
    ]);
    const escapeCsvValue = (value) => {
      const text = String(value ?? "").replace(/"/g, '""');
      return `"${text}"`;
    };
    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "existing-clients.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.fullName || !formData.mobile || !formData.email || formData.amount === "") {
      setFormError("Please fill in all mandatory fields (Name, Mobile, Email, Amount).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Invalid email address format.");
      return;
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setFormError("Invalid 10-digit Indian mobile number.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add client");
      }
      alert("Client added successfully!");
      setShowAddModal(false);
      setFormData({ fullName: "", mobile: "", email: "", eventName: "", quantity: 1, amount: "", paymentStatus: "SUCCESS", transactionId: "", remarks: "" });
      fetchClients();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePause = async (email, isPaused) => {
    if (!confirm(`Are you sure you want to ${isPaused ? 'pause' : 'resume'} event filing for this client?`)) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/clients/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ email, isPaused })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update client status");
      fetchClients();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className='client-banner'>
        <div>
          <span><Users /></span>
          <div><h2>Client List</h2></div>
        </div>
        <b>{clients.length}<small>Total Clients</small></b>
      </div>

      <section className='admin-panel'>
        <div className='table-toolbar'>
          <div className='admin-search'>
            <Search />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search clients...' />
          </div>
          <button type='button' className='admin-secondary' onClick={exportClientsCsv}>
            <Download /> Export CSV
          </button>
          <button type='button' className='admin-primary' onClick={() => setShowAddModal(true)}>
            <Plus /> Add Client Manually
          </button>
        </div>

        {error && (
          <div className='admin-error'><p>{error}</p></div>
        )}

        <div className='admin-table-wrap'>
          <table className='admin-table wide'>
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan='5' className='table-empty'>Loading clients...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan='5' className='table-empty'>{query ? "No matching clients found." : "No clients found in the database."}</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td><b>{client.name || "Unnamed Client"}</b></td>
                    <td>{client.email || "—"}</td>
                    <td>{client.phone || "—"}</td>
                    <td>{formatDate(client.createdAt)}</td>
                    <td>
                      <button type='button' className='icon-button' aria-label={`Actions for ${client.name}`}>
                        <MoreHorizontal />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Manual Client Entry Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Add Client Manually</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            
            {formError && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{formError}</div>}
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Full Name *</label>
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Mobile Number *</label>
                  <input name="mobile" value={formData.mobile} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Event (Optional)</label>
                  <input name="eventName" value={formData.eventName} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="e.g. Workshop 2026" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Number of Tickets *</label>
                  <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Amount (₹) *</label>
                  <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Payment Status</label>
                  <select name="paymentStatus" value={formData.paymentStatus} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="SUCCESS">Success</option>
                    <option value="INITIATED">Initiated</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Transaction ID (Optional)</label>
                  <input name="transactionId" value={formData.transactionId} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Auto-generated if empty" />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Remarks (Optional)</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} rows="3"></textarea>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="admin-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="admin-primary" style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {isSubmitting ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
