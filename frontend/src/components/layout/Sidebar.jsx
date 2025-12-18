import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: "/dashboard",
      icon: "📊",
      label: "Dashboard",
      active: location.pathname === "/dashboard",
    },
    {
      path: "/tables",
      icon: "🎱",
      label: "Tables",
      active: location.pathname.includes("/tables"),
    },
    {
      path: "/bookings",
      icon: "📅",
      label: "Bookings",
      active: location.pathname === "/bookings",
    },
    {
      path: "/members",
      icon: "👥",
      label: "Members",
      active: location.pathname === "/members",
    },
    {
      path: "/billing",
      icon: "💳",
      label: "Billing",
      active: location.pathname === "/billing",
    },
    {
      path: "/reports",
      icon: "📈",
      label: "Reports",
      active: location.pathname === "/reports",
    },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {!isCollapsed && <span>Snooker Club</span>}
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
        <button className="logout-btn">
          <span>🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
