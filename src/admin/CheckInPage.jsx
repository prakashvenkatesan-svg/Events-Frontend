import {
  AlertTriangle,
  Camera,
  Check,
  Keyboard,
  QrCode,
  RotateCcw,
  Users,
} from "lucide-react";
import { useState } from "react";
export default function CheckInPage() {
  const [state, setState] = useState("idle");
  return (
    <>
      <div className="checkin-header">
        <div>
          <label>Selected Event</label>
          <select>
            <option>Money Pechu Fans Meet Chennai 2026</option>
            <option>Free Money Book Release</option>
          </select>
        </div>
        <div className="live-stat">
          <Users />
          <span>
            <b>184 / 342</b>
            <small>Attendees checked in</small>
          </span>
          <i>
            <em style={{ width: "54%" }} />
          </i>
        </div>
      </div>
      <div className="checkin-grid">
        <section className="scanner-panel">
          <div className="scanner-top">
            <span>
              <i /> Scanner Ready
            </span>
            <button>
              <Camera /> Switch Camera
            </button>
          </div>
          <div className="camera-view">
            <div className="scan-frame">
              <i />
              <i />
              <i />
              <i />
              <span />
            </div>
            <QrCode />
            <p>Position the attendee QR code inside the frame</p>
            <button
              onClick={() => setState("success")}
              className="simulate-scan"
            >
              Simulate Valid Scan
            </button>
            <button
              onClick={() => setState("error")}
              className="simulate-error"
            >
              Simulate Used QR
            </button>
          </div>
          <button className="manual-code">
            <Keyboard /> Enter booking ID manually
          </button>
        </section>
        <aside className="scan-result">
          <h3>Scan Result</h3>
          {state === "idle" && (
            <div className="result-empty">
              <QrCode />
              <p>Scan a ticket to see attendee details here.</p>
            </div>
          )}
          {state === "success" && (
            <div className="result-success">
              <span>
                <Check />
              </span>
              <h2>Check-In Successful</h2>
              <p>Welcome to the event!</p>
              <div>
                <small>Attendee</small>
                <b>Riya Sharma</b>
                <small>Ticket Type</small>
                <b>General Admission</b>
                <small>Booking ID</small>
                <b>MP-182945</b>
                <small>Check-in Time</small>
                <b>04:42 PM</b>
              </div>
              <button onClick={() => setState("idle")}>
                <RotateCcw /> Scan Next Ticket
              </button>
            </div>
          )}
          {state === "error" && (
            <div className="result-error">
              <span>
                <AlertTriangle />
              </span>
              <h2>Already Checked In</h2>
              <p>This ticket was scanned at 04:31 PM.</p>
              <div>
                <small>Attendee</small>
                <b>Arun Kumar</b>
                <small>Booking ID</small>
                <b>MP-182944</b>
              </div>
              <button onClick={() => setState("idle")}>
                <RotateCcw /> Try Another Ticket
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
