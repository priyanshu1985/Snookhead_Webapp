import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { GameProvider } from "../context/GameContext";
import { BookingProvider } from "../context/BookingContext";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks";

// Auth Pages
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";

// Dashboard
import Dashboard from "../pages/dashboard/Dashboard";

// Table Management
import Tables from "../pages/tables/Tables";
import TableDetails from "../pages/tables/TableDetails";

// Booking Management
import Bookings from "../pages/bookings/Bookings";

// Billing
import Billing from "../pages/billing/Billing";

// Member Management
import Members from "../pages/members/Members";

// Reports
import Reports from "../pages/reports/Reports";

// New Pages
import OwnersPanel from "../pages/owners/OwnersPanel";
import SetupMenu from "../pages/setup/SetupMenu";
import Inventory from "../pages/inventory/Inventory";
import Subscription from "../pages/subscription/Subscription";
import ReportBugs from "../pages/bugs/ReportBugs";
import Privacy from "../pages/privacy/Privacy";
import FoodScanner from "../pages/food/FoodScanner";

// Root Redirect Component
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

// Routes Component (inside providers)
const AppRoutesInternal = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Tables */}
      <Route
        path="/tables"
        element={
          <ProtectedRoute>
            <Layout>
              <Tables />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tables/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TableDetails />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Bookings */}
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Layout>
              <Bookings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Billing */}
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <Layout>
              <Billing />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Members */}
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <Layout>
              <Members />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* New Pages */}
      <Route
        path="/owners-panel"
        element={
          <ProtectedRoute>
            <Layout>
              <OwnersPanel />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/setup-menu"
        element={
          <ProtectedRoute>
            <Layout>
              <SetupMenu />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Layout>
              <Inventory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Layout>
              <Subscription />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bugs"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportBugs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy"
        element={
          <ProtectedRoute>
            <Layout>
              <Privacy />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/food-scanner"
        element={
          <ProtectedRoute>
            <Layout>
              <FoodScanner />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 - Redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <GameProvider>
          <BookingProvider>
            <AppRoutesInternal />
          </BookingProvider>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
