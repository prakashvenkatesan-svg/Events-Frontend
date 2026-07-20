import { useState } from "react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://events.moneypechu.com"
).replace(/\/$/, "");

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function BookingPanel({ event }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ticketPrice = Number(event?.price ?? event?.amount ?? 0);

  const validateField = (field, rawValue) => {
    const value = String(rawValue || "").trim();

    if (field === "name") {
      if (!value) {
        return "Full name is required.";
      }

      if (value.length < 2) {
        return "Enter at least 2 characters.";
      }

      if (value.length > 120) {
        return "Name cannot exceed 120 characters.";
      }

      if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
        return "Name contains invalid characters.";
      }
    }

    if (field === "email") {
      if (!value) {
        return "Email address is required.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Enter a valid email address.";
      }
    }

    if (field === "mobile") {
      if (!value) {
        return "Mobile number is required.";
      }

      if (!/^[6-9]\d{9}$/.test(value)) {
        return "Enter a valid 10-digit Indian mobile number.";
      }
    }

    return "";
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      mobile: validateField("mobile", form.mobile),
    };

    Object.keys(nextErrors).forEach((field) => {
      if (!nextErrors[field]) {
        delete nextErrors[field];
      }
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const update = (field) => (e) => {
    let value = e.target.value;

    if (field === "mobile") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      const nextErrors = { ...previous };
      const fieldError = validateField(field, value);

      if (fieldError) {
        nextErrors[field] = fieldError;
      } else {
        delete nextErrors[field];
      }

      return nextErrors;
    });

    setSubmitError("");
  };

  const handleBlur = (field) => {
    const fieldError = validateField(field, form[field]);

    setErrors((previous) => {
      const nextErrors = { ...previous };

      if (fieldError) {
        nextErrors[field] = fieldError;
      } else {
        delete nextErrors[field];
      }

      return nextErrors;
    });
  };

  const submitToPayU = (payuUrl, payuParams) => {
    if (!payuUrl) {
      throw new Error("PayU payment URL is missing.");
    }

    if (!payuParams || typeof payuParams !== "object") {
      throw new Error("PayU payment details are missing.");
    }

    const paymentForm = document.createElement("form");

    paymentForm.method = "POST";
    paymentForm.action = payuUrl;
    paymentForm.style.display = "none";
    paymentForm.acceptCharset = "UTF-8";

    Object.entries(payuParams).forEach(([name, value]) => {
      const input = document.createElement("input");

      input.type = "hidden";
      input.name = name;
      input.value = String(value ?? "");

      paymentForm.appendChild(input);
    });

    document.body.appendChild(paymentForm);
    paymentForm.submit();
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitError("Please correct the highlighted fields.");
      return;
    }

    const databaseEventId = String(
      event?.databaseId || event?.uuid || "",
    ).trim();

    if (!databaseEventId) {
      setSubmitError(
        "This event is not connected to a database event.",
      );

      console.error("Missing databaseId in event object:", event);
      return;
    }

    if (!UUID_PATTERN.test(databaseEventId)) {
      setSubmitError("The event database ID is invalid.");

      console.error(
        "Invalid event database UUID:",
        databaseEventId,
      );

      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const requestBody = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile,
        eventId: databaseEventId,
      };

      console.log("API URL:", API_BASE_URL);
      console.log("Event slug:", event?.id);
      console.log("Database Event UUID:", databaseEventId);
      console.log("Booking request:", requestBody);

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/initiate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(requestBody),
        },
      );

      const contentType =
        response.headers.get("content-type") || "";

      let result;

      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const responseText = await response.text();

        result = {
          message:
            responseText ||
            `Server returned status ${response.status}`,
        };
      }

      console.log("Booking API response:", result);

      if (!response.ok) {
        if (result.errors) {
          setErrors((previous) => ({
            ...previous,
            ...result.errors,
          }));

          console.error(
            "Backend validation errors:",
            result.errors,
          );
        }

        throw new Error(
          result.message ||
            `Booking failed with status ${response.status}`,
        );
      }

      if (!result.payuUrl || !result.payuParams) {
        throw new Error(
          "Booking was created, but PayU details are missing.",
        );
      }

      sessionStorage.setItem(
        "mp_booking_code",
        result.bookingCode,
      );

      sessionStorage.setItem(
        "mp_transaction_id",
        result.txnid,
      );

      submitToPayU(
        result.payuUrl,
        result.payuParams,
      );
    } catch (error) {
      console.error(
        "Booking submission error:",
        error,
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to initiate the booking.",
      );

      setSubmitting(false);
    }
  };

  return (
    <aside className="booking-panel">
      <div className="booking-head">
        <span>Book Your Ticket</span>
        <small>Limited seats available</small>
      </div>

      <form onSubmit={submit} noValidate>
        <label>
          Full Name

          <input
            type="text"
            value={form.name}
            onChange={update("name")}
            onBlur={() => handleBlur("name")}
            placeholder="Enter your full name"
            autoComplete="name"
            maxLength={120}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={
              errors.name ? "name-error" : undefined
            }
          />

          {errors.name && (
            <small
              id="name-error"
              className="field-error"
              role="alert"
            >
              {errors.name}
            </small>
          )}
        </label>

        <label>
          Email Address

          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            onBlur={() => handleBlur("email")}
            placeholder="name@email.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "email-error" : undefined
            }
          />

          {errors.email && (
            <small
              id="email-error"
              className="field-error"
              role="alert"
            >
              {errors.email}
            </small>
          )}
        </label>

        <label>
          Mobile Number

          <div
            className={`phone-field ${
              errors.mobile ? "input-error" : ""
            }`}
          >
            <span>+91</span>

            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.mobile}
              onChange={update("mobile")}
              onBlur={() => handleBlur("mobile")}
              placeholder="10-digit number"
              autoComplete="tel"
              aria-invalid={Boolean(errors.mobile)}
              aria-describedby={
                errors.mobile
                  ? "mobile-error"
                  : undefined
              }
            />
          </div>

          {errors.mobile && (
            <small
              id="mobile-error"
              className="field-error"
              role="alert"
            >
              {errors.mobile}
            </small>
          )}
        </label>

        {errors.eventId && (
          <p className="form-error" role="alert">
            {errors.eventId}
          </p>
        )}

        {submitError && (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        )}

        <div className="summary">
          <h3>Booking Summary</h3>

          <p>
            <span>Event</span>
            <b>{event?.title || "Event Ticket"}</b>
          </p>

          <p>
            <span>Ticket Price</span>
            <b>₹ {ticketPrice.toLocaleString("en-IN")}</b>
          </p>

          <p>
            <span>Quantity</span>
            <b>1</b>
          </p>

          <div>
            <span>Total Amount</span>

            <strong>
              ₹ {ticketPrice.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <button
          className="primary-button full"
          type="submit"
          disabled={
            submitting ||
            !event?.databaseId
          }
        >
          {submitting
            ? "Redirecting to PayU..."
            : "Confirm Booking"}
        </button>

        {!event?.databaseId && (
          <p className="form-error">
            Database event ID is missing.
          </p>
        )}

        <p className="secure-note">
          🔒 Secure payment powered by PayU
        </p>
      </form>
    </aside>
  );
}