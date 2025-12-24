import { useState, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";

import InventoryTabs from "../../components/inventory/InventoryTabs";
import InventoryStats from "../../components/inventory/InventoryStats";
import InventoryFilters from "../../components/inventory/InventoryFilters";
import InventoryList from "../../components/inventory/InventoryList";

import "../../styles/inventoryTracking.css";

const InventoryTracking = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [activeTab, setActiveTab] = useState("cafe");

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="inventory-page">
          <h5>← Inventory Tracking</h5>

          {/* Search */}
          <div className="inventory-search">
            <input placeholder="Search" />
            <span>🎤</span>
          </div>

          {/* Tabs */}
          <InventoryTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Stats */}
          <InventoryStats />

          {/* Filters */}
          <InventoryFilters />

          {/* List */}
          <InventoryList activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default InventoryTracking;
