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
            const email = e.target.email.value;
            const password = e.target.password.value;
            if (email === "events@coronacreative.in" && password === "Corona@777") {
              navigate("/admin");
            } else {
              alert("Invalid email or password");
            }
          }}
        >
          <label>
            Email
            <div>
              <Mail />
              <input
                type="email"
                name="email"
                placeholder="events@coronacreative.in"
                required
              />
            </div>
          </label>
          <label>
            Password
            <div>
              <LockKeyhole />
              <input type="password" name="password" placeholder="Password" required />
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
