import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LayoutContext } from "../../context/LayoutContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/sidebar.css";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(LayoutContext);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate("/login");
  };

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <h5 className="brand">SNOKEHEAD</h5>
          <div className="user-card">
            <div className="user-avatar">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
            </div>
            <div className="user-info">
              <strong>{user?.name || "User"}</strong>
              <small>{user?.role || "Staff"}</small>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/owners" className="menu-item" onClick={closeSidebar}>
            Owners panel
          </NavLink>
          <NavLink to="/setup-menu" className="menu-item" onClick={closeSidebar}>
            Set up menu
          </NavLink>
          <NavLink to="/inventory" className="menu-item" onClick={closeSidebar}>
            Inventory tracking
          </NavLink>
          <NavLink to="/subscription" className="menu-item" onClick={closeSidebar}>
            Upgrade subscription
          </NavLink>
          <NavLink to="/report-bugs" className="menu-item" onClick={closeSidebar}>
            Report bugs
          </NavLink>
          <NavLink to="/privacy-policy" className="menu-item" onClick={closeSidebar}>
            Privacy & Policy
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>
    </>
  );
};

export default Sidebar;
