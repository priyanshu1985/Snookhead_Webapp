import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LayoutContext } from "../../context/LayoutContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/sidebar.css";

const Sidebar = () => {
  const { 
    isSidebarCollapsed, 
    toggleSidebarCollapse, 
    isSidebarOpen, 
    closeSidebar 
  } = useContext(LayoutContext);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${isSidebarOpen ? "open" : ""}`}>
        {/* Mobile Close Button */}
        <button className="sidebar-close" onClick={closeSidebar}>
          ×
        </button>

        {/* Toggle Button Removed as per request */}
        {/* <button className="sidebar-toggle" onClick={toggleSidebarCollapse}>
          <span className="toggle-arrow">‹</span>
        </button> */}

        <div className="sidebar-top">
          <div className="brand-container">
            <img 
              src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/static/app-logo/logo.jpg`} 
              alt="Snokehead Logo" 
              className="brand-logo"
            />
            <h5 className="brand">SNOOKHEAD</h5>
          </div>
          <div className="user-card">
            <div className="user-avatar">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="User"
              />
            </div>
            <div className="user-info">
              <strong>{user?.name || "User"}</strong>
              <small>{user?.role || "Staff"}</small>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <NavLink 
            to="/owners" 
            className="menu-item"
            onClick={() => closeSidebar()}
          >
            Owners panel
          </NavLink>
          <NavLink 
            to="/setup-menu" 
            className="menu-item"
            onClick={() => closeSidebar()}
          >
            Set up menu
          </NavLink>
          <NavLink 
            to="/inventory" 
            className="menu-item"
            onClick={() => closeSidebar()}
          >
            Inventory tracking
          </NavLink>
          <NavLink 
            to="/members" 
            className="menu-item"
            onClick={() => closeSidebar()}
          >
            Members
          </NavLink>
          <NavLink 
            to="/reservations" 
            className="menu-item"
            onClick={() => closeSidebar()}
          >
            Reservations
          </NavLink>
          <NavLink 
            to="/subscription" 
            className="menu-item"
            onClick={() => closeSidebar()}
          >
            Upgrade subscription
          </NavLink>
          <NavLink 
            to="/report-bugs" 
            className="menu-item"
            onClick={() => closeSidebar()}
          >
            Report bugs
          </NavLink>
          <NavLink 
            to="/privacy-policy" 
            className="menu-item"
            onClick={() => closeSidebar()}
          >
            Privacy & Policy
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
