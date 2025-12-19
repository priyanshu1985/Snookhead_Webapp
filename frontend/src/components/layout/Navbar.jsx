import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/navbar.css";

const Navbar = () => {
  const { toggleSidebar } = useContext(LayoutContext);

  return (
    <header className="topbar">
      {/* LEFT: Hamburger (mobile only) */}
      <div className="topbar-left">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* Desktop search only */}
        <input
          type="text"
          className="search-input desktop-only"
          placeholder="Search..."
        />
      </div>

      {/* CENTER NAVIGATION */}
      <nav className="topbar-center">
        <NavLink to="/" end className="nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <NavLink to="/bookings" className="nav-item">
          <span className="nav-icon">⏱</span>
          <span className="nav-text">Queue</span>
        </NavLink>

        <NavLink to="/billing" className="nav-item">
          <span className="nav-icon">🧾</span>
          <span className="nav-text">Billing</span>
        </NavLink>

        <NavLink to="/food-orders" className="nav-item">
          <span className="nav-icon">🍔</span>
          <span className="nav-text">Food & Order</span>
        </NavLink>
      </nav>

      {/* RIGHT: Desktop actions only */}
      <div className="topbar-right desktop-only">
        <button className="btn btn-warning btn-sm">Add member</button>
        <span className="date-chip">02/08/2025</span>
      </div>
    </header>
  );
};

export default Navbar;
