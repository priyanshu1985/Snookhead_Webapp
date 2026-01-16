import { useState, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import OwnerSafetyPanel from "../../components/owner/OwnerSafetyPanel";
import "../../styles/owners.css";

const OwnersPanel = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <OwnerSafetyPanel>
          <div className="owners-dashboard">
            <h5>← Owners panel</h5>

            {/* TOP CARDS */}
            <div className="owners-cards">
              <div className="card">
                <p>Total Revenue</p>
                <h4>$8,459</h4>
                <span className="up">↑ 12.5%</span>
              </div>

              <div className="card">
                <p>Net Profit</p>
                <h4>$3,245</h4>
                <span className="up">↑ 8.3%</span>
              </div>

              <div className="card">
                <p>Expenses</p>
                <h4>$3,245</h4>
                <span className="up">↑ 8.3%</span>
              </div>
            </div>

            {/* OCCUPANCY */}
            <div className="occupancy">
              <p>Occupancy Rate</p>
              <h4>72%</h4>
              <div className="progress">
                <span style={{ width: "72%" }} />
              </div>
            </div>

            {/* REGISTRATION */}
            <div className="wallet-section">
              <div className="wallet-card active">
                <p>Active Wallets</p>
                <h4>128</h4>
              </div>

              <div className="wallet-card">
                <p>Inactive Wallets</p>
                <h4>7</h4>
              </div>

              <div className="wallet-card warning">
                <p>Credit Member</p>
                <h4>12</h4>
              </div>
            </div>
          </div>
        </OwnerSafetyPanel>
      </div>
    </div>
  );
};

export default OwnersPanel;
