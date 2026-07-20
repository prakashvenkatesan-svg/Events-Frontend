import {
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const file = useRef(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/admin/clients`, {
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
        throw new Error(data.message || "Failed to fetch clients");
      }

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
  }, []);

  const filteredClients = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    if (!searchText) {
      return clients;
    }

    return clients.filter((client) => {
      const searchableText = `
        ${client.name || ""}
        ${client.email || ""}
        ${client.phone || ""}
        
      `.toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [clients, query]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportClientsCsv = () => {
    if (clients.length === 0) {
      alert("No client data available to export.");
      return;
    }

    const headers = ["Name", "Email", "Mobile", "Client Type", "Added On"];

    const rows = clients.map((client) => [
      client.name || "",
      client.email || "",
      client.phone || "",

      formatDate(client.createdAt),
    ]);

    const escapeCsvValue = (value) => {
      const text = String(value ?? "").replace(/"/g, '""');
      return `"${text}"`;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = downloadUrl;
    anchor.download = "existing-clients.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <>
      <div className='client-banner'>
        <div>
          <span>
            <Users />
          </span>

          <div>
            <h2>Client List</h2>
            {/* <p>
              Manage approved emails and mobile numbers used for client-only
              event validation.
            </p> */}
          </div>
        </div>

        <b>
          {clients.length}
          <small>Total Clients</small>
        </b>
      </div>

      <section className='admin-panel'>
        <div className='table-toolbar'>
          <div className='admin-search'>
            <Search />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search clients...'
            />
          </div>

          <input ref={file} type='file' accept='.csv' hidden />

          {/* <button
            type='button'
            className='admin-secondary'
            onClick={() => file.current?.click()}
          >
            <Upload />
            Import CSV
          </button> */}

          <button
            type='button'
            className='admin-secondary'
            onClick={exportClientsCsv}
          >
            <Download />
            Export CSV
          </button>

          {/* <button type='button' className='admin-primary'>
            <Plus />
            Add Client
          </button> */}
        </div>

        {error && (
          <div className='admin-error'>
            <p>{error}</p>

            {/* <button type='button' onClick={fetchClients}>
              Try Again
            </button> */}
          </div>
        )}

        <div className='admin-table-wrap'>
          <table className='admin-table wide'>
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan='6' className='table-empty'>
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan='6' className='table-empty'>
                    {query
                      ? "No matching clients found."
                      : "No clients found in the database."}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <b>{client.name || "Unnamed Client"}</b>
                    </td>

                    <td>{client.email || "—"}</td>

                    <td>{client.phone || "—"}</td>

                    <td>{formatDate(client.createdAt)}</td>

                    <td>
                      <button
                        type='button'
                        className='icon-button'
                        aria-label={`Actions for ${client.name}`}
                      >
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
    </>
  );
}
