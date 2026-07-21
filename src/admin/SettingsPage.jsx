import { Bell, CreditCard, Save, ShieldCheck, UserRound } from "lucide-react";
export default function SettingsPage() {
  return (
    <div className="settings-grid">
      <aside className="settings-nav">
        <button className="active">
          <UserRound /> Profile
        </button>
        <button>
          <CreditCard /> Payment Gateways
        </button>
        <button>
          <Bell /> Notifications
        </button>
        <button>
          <ShieldCheck /> Security
        </button>
      </aside>
      <section className="admin-panel settings-panel">
        <div className="editor-title">
          <h2>Organizer Profile</h2>
          <p>Update the information used across your events.</p>
        </div>
        <div className="profile-avatar">
          <i>MP</i>
          <span>
            <b>Organization Logo</b>
            <small>PNG or JPG, up to 2 MB</small>
          </span>
          <button className="admin-secondary">Change Logo</button>
        </div>
        <div className="form-grid">
          <label className="admin-field">
            <span>Organization Name</span>
            <input defaultValue="MoneyPechu" />
          </label>
          <label className="admin-field">
            <span>Contact Person</span>
            <input defaultValue="Anand Srinivasan" />
          </label>
          <label className="admin-field">
            <span>Email Address</span>
            <input defaultValue="events@moneypechu.com" />
          </label>
          <label className="admin-field">
            <span>Mobile Number</span>
            <input defaultValue="+91 9150043968" />
          </label>
          <label className="admin-field full">
            <span>Address</span>
            <textarea rows="4" defaultValue="Chennai, Tamil Nadu, India" />
          </label>
        </div>
        <button className="admin-primary">
          <Save /> Save Changes
        </button>
      </section>
    </div>
  );
}
