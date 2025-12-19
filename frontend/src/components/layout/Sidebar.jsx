import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";
import "../../styles/sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/owners-panel",
      icon: "👤",
      label: "Owners panel",
      active: location.pathname === "/owners-panel",
    },
    {
      path: "/setup-menu",
      icon: "⚙️",
      label: "Set up menu",
      active: location.pathname === "/setup-menu",
    },
    {
      path: "/inventory",
      icon: "📦",
      label: "Inventory tracking",
      active: location.pathname === "/inventory",
    },
    {
      path: "/subscription",
      icon: "⬆️",
      label: "Upgrade subscription",
      active: location.pathname === "/subscription",
    },
    {
      path: "/bugs",
      icon: "🐛",
      label: "Report bugs",
      active: location.pathname === "/bugs",
    },
    {
      path: "/privacy",
      icon: "🔒",
      label: "Privacy and Policy",
      active: location.pathname === "/privacy",
    },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {!isCollapsed && (
            <>
              <span className="brand-icon">🎱</span>
              <span className="brand-text">SNOKEHEAD</span>
            </>
          )}
        </div>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${item.active ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">Admin</span>
              <span className="user-role">Administrator</span>
            </div>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
