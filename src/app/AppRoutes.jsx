import { Routes, Route } from "react-router-dom";
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
        <Route path="/billing" element={<Billing />} />
        <Route path="/food-orders" element={<FoodOrder />} />

        <Route path="/owners" element={<OwnersPanel />} />
        <Route path="/subscription" element={<UpgradeSubscription />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/report-bugs" element={<ReportBugs />} />
        <Route path="/report-bugs/create" element={<CreateBug />} />
        <Route path="/setup-menu" element={<SetupMenu />} />
        <Route path="/inventory" element={<InventoryTracking />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
