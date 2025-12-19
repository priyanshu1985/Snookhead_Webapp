import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/sidebar.css";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(LayoutContext);

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <h5 className="brand">SNOKEHEAD</h5>
          <div className="user-box">
            <strong>Austin Robertson</strong>
            <small>Marketing Administrator</small>
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

        <button className="logout-btn">Logout</button>
      </aside>
    </>
  );
};

export default Sidebar;
