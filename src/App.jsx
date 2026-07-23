import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import EventPage from "./pages/EventPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminLayout from "./admin/AdminLayout";
import DashboardPage from "./admin/DashboardPage";
import EventsPage from "./admin/EventsPage";
import EventEditorPage from "./admin/EventEditorPage";
import BookingsPage from "./admin/BookingsPage";
import CheckInPage from "./admin/CheckInPage";
import PaymentsPage from "./admin/PaymentsPage";
import ClientsPage from "./admin/ClientsPage";
import SettingsPage from "./admin/SettingsPage";
import EventLimitsPage from "./admin/EventLimitsPage";

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/events/:eventId' element={<EventPage />} />
      <Route path='/confirmation/:eventId' element={<ConfirmationPage />} />
      <Route path='/admin/login' element={<AdminLoginPage />} />
      <Route path='/admin' element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path='events' element={<EventsPage />} />
        <Route path='events/new' element={<EventEditorPage />} />
        <Route path='events/:eventId/edit' element={<EventEditorPage />} />
        <Route path='bookings' element={<BookingsPage />} />
        <Route path='check-in' element={<CheckInPage />} />
        <Route path='payments' element={<PaymentsPage />} />
        <Route path='clients' element={<ClientsPage />} />
        <Route path='event-limits' element={<EventLimitsPage />} />
        <Route path='settings' element={<SettingsPage />} />
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}
