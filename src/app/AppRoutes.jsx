import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login";
import Dashboard from "../pages/dashboard/Dashboard";
import Layout from "./Layout";
import Bookings from "../pages/bookings/Bookings";
import AddQueue from "../pages/bookings/AddQueue";
import UpcomingReservation from "../pages/bookings/UpcomingReservation";
import Billing from "../pages/billing/Billing";
import FoodOrder from "../pages/food/FoodOrder";

import OwnersPanel from "../pages/owners/OwnersPanel";
import UpgradeSubscription from "../pages/subscription/UpgradeSubscription";
import PrivacyPolicy from "../pages/subscription/PrivacyPolicy";
import ReportBugs from "../pages/bugs/ReportBugs";
import CreateBug from "../pages/bugs/CreateBug";
import SetupMenu from "../pages/setup-menu/SetupMenu";
import InventoryTracking from "../pages/inventory/InventoryTracking";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

import TableBooking from "../pages/tables/TableBooking";
import ActiveSession from "../pages/tables/ActiveSession";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Route - Redirect to dashboard if already logged in */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Area */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/add-queue" element={<AddQueue />} />
        <Route
          path="/bookings/upcoming-reservation"
          element={<UpcomingReservation />}
        />
        <Route path="/billing" element={<Billing />} />
        <Route path="/food-orders" element={<FoodOrder />} />

        <Route path="/owners" element={<OwnersPanel />} />
        <Route path="/subscription" element={<UpgradeSubscription />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/report-bugs" element={<ReportBugs />} />
        <Route path="/report-bugs/create" element={<CreateBug />} />
        <Route path="/setup-menu" element={<SetupMenu />} />
        <Route path="/inventory" element={<InventoryTracking />} />

        <Route path="/tables/:game/:tableId" element={<TableBooking />} />
        <Route path="/session/:game/:tableId" element={<ActiveSession />} />
        <Route path="/session/:game/:tableId/:sessionId" element={<ActiveSession />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
