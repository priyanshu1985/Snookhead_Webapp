import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Toggle sidebar for mobile
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    if (sidebar) {
      sidebar.classList.toggle("open");
    }
    if (overlay) {
      overlay.classList.toggle("active");
    }
  };

  return (
    <nav className="top-navbar horizontal-navbar">
      <div className="navbar-nav">
        <Link
          to="/dashboard"
          className={`nav-item ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
        >
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link
          to="/bookings"
          className={`nav-item ${
            location.pathname === "/bookings" ? "active" : ""
          }`}
        >
          <i className="fas fa-clock"></i>
          <span>Queue</span>
        </Link>
        <Link
          to="/billing"
          className={`nav-item ${
            location.pathname === "/billing" ? "active" : ""
          }`}
        >
          <i className="fas fa-receipt"></i>
          <span>Billing</span>
        </Link>
        <Link
          to="/food-scanner"
          className={`nav-item ${
            location.pathname === "/food-scanner" ? "active" : ""
          }`}
        >
          <i className="fas fa-qrcode"></i>
          <span>Food & Scanner</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
