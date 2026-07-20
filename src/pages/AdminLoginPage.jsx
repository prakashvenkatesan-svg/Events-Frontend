import { LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  return (
    <main className="admin-page">
      <section className="admin-card">
        <Link to="/">
          <img src="/assets/logo.png" alt="MoneyPechu" />
        </Link>
        <h1>Admin Login</h1>
        <p>Sign in to manage events and bookings.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/admin");
          }}
        >
          <label>
            Email
            <div>
              <Mail />
              <input
                type="email"
                placeholder="admin@moneypechu.com"
                required
              />
            </div>
          </label>
          <label>
            Password
            <div>
              <LockKeyhole />
              <input type="password" placeholder="Password" required />
            </div>
          </label>
          <button className="primary-button full">Sign In</button>
        </form>
        <Link className="back-link" to="/">
          ← Back to events
        </Link>
      </section>
    </main>
  );
}
