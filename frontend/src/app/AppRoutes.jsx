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

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <GameProvider>
          <BookingProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes with Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        {/* Dashboard */}
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" replace />}
                        />
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Tables */}
                        <Route path="/tables" element={<Tables />} />
                        <Route path="/tables/:id" element={<TableDetails />} />

                        {/* Bookings */}
                        <Route path="/bookings" element={<Bookings />} />

                        {/* Billing */}
                        <Route path="/billing" element={<Billing />} />

                        {/* Members */}
                        <Route path="/members" element={<Members />} />

                        {/* Reports */}
                        <Route path="/reports" element={<Reports />} />

                        {/* 404 - Redirect to dashboard */}
                        <Route
                          path="*"
                          element={<Navigate to="/dashboard" replace />}
                        />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BookingProvider>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
