import React from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import "../styles/layout.css";

const Layout = ({ children }) => {
  const handleOverlayClick = () => {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    if (sidebar) {
      sidebar.classList.remove("open");
    }
    if (overlay) {
      overlay.classList.remove("active");
    }
  };

  return (
    <div className="app-layout">
      <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      <Sidebar />
      <div className="main-layout">
        <Navbar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
