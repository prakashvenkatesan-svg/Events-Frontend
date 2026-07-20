# MoneyPechu Events — React Website

Responsive React/Vite implementation of the supplied MoneyPechu event ticket booking UI.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

## Included routes

- `/` — event landing page
- `/events/fans-meet` — Fans Meet detail and booking
- `/events/free-money-book-release` — Book Release detail and booking
- `/confirmation/:eventId` — confirmation and QR e-ticket
- `/admin/login` — admin login UI
- `/admin` — organizer dashboard overview
- `/admin/events` — events list and management
- `/admin/events/new` — tabbed event creation form
- `/admin/bookings` — searchable booking registrations
- `/admin/check-in` — interactive QR check-in scanner UI
- `/admin/payments` — online payments and offline approvals
- `/admin/clients` — existing-client list and CSV import
- `/admin/settings` — organizer settings

Use the pre-filled demo credentials on the admin login page and click **Sign In**.
