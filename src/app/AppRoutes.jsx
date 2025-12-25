import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login";
import Register from "../pages/auth/Register";
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
import { useAuth } from "../context/AuthContext";
import Members from "../pages/members/Members";

import TableBooking from "../pages/tables/TableBooking";
import ActiveSession from "../pages/tables/ActiveSession";
import StaffOrders from "../pages/staff/StaffOrders";
import AdminDashboard from "../pages/admin/AdminDashboard";

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  // Get user role (default to empty if not authenticated)
  const userRole = isAuthenticated ? user?.role?.toLowerCase() || "staff" : "";

  // Not authenticated - show login/register only
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // STAFF role - only show staff orders page
  if (userRole === "staff") {
    return (
      <Routes>
        <Route path="/staff-orders" element={<StaffOrders />} />
        <Route path="*" element={<Navigate to="/staff-orders" replace />} />
      </Routes>
    );
  }

  // ADMIN role - show analytics page
  if (userRole === "admin") {
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // OWNER role - full access to all pages
  return (
    <Routes>
      {/* Redirect login/register to dashboard if already authenticated */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      {/* Main app with layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
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
        <Route path="/members" element={<Members />} />

        <Route path="/tables/:game/:tableId" element={<TableBooking />} />
        <Route path="/session/:game/:tableId" element={<ActiveSession />} />
        <Route
          path="/session/:game/:tableId/:sessionId"
          element={<ActiveSession />}
        />
      </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
