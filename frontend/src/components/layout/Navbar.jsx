import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" className="brand-link">
          <h2>Snooker Club</h2>
        </Link>
      </div>

      <div className="navbar-menu">
        <Link
          to="/dashboard"
          className={`nav-link ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/tables"
          className={`nav-link ${
            location.pathname.includes("/tables") ? "active" : ""
          }`}
        >
          Tables
        </Link>
        <Link
          to="/bookings"
          className={`nav-link ${
            location.pathname === "/bookings" ? "active" : ""
          }`}
        >
          Bookings
        </Link>
        <Link
          to="/members"
          className={`nav-link ${
            location.pathname === "/members" ? "active" : ""
          }`}
        >
          Members
        </Link>
        <Link
          to="/billing"
          className={`nav-link ${
            location.pathname === "/billing" ? "active" : ""
          }`}
        >
          Billing
        </Link>
        <Link
          to="/reports"
          className={`nav-link ${
            location.pathname === "/reports" ? "active" : ""
          }`}
        >
          Reports
        </Link>
      </div>

      <div className="navbar-actions">
        <div className="user-menu">
          <span className="user-name">Admin</span>
          <button className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
