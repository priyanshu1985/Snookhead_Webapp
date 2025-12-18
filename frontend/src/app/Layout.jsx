import React from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
