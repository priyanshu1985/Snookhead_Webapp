import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/login";
import Dashboard from "../pages/dashboard/Dashboard";
import Layout from "./Layout";
import Bookings from "../pages/bookings/Bookings";
import AddQueue from "../pages/bookings/AddQueue";
import UpcomingReservation from "../pages/bookings/UpcomingReservation";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Area */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/add-queue" element={<AddQueue />} />
        <Route
          path="/bookings/upcoming-reservation"
          element={<UpcomingReservation />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
