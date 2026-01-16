import { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import { inventoryAPI } from "../../services/api";

import InventoryTabs from "../../components/inventory/InventoryTabs";
import InventoryStats from "../../components/inventory/InventoryStats";
import InventoryFilters from "../../components/inventory/InventoryFilters";
import InventoryList from "../../components/inventory/InventoryList";
import AddItemModal from "../../components/inventory/AddItemModal";

import "../../styles/inventoryTracking.css";

const InventoryTracking = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [activeTab, setActiveTab] = useState("Cafe Asset");
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch list based on active tab (category) and filter
      // Note: Backend supports category and status filters.
      // We'll filter by category on backend + client side or just backend.
      // Let's use backend for efficient category filtering.
      
      const params = {
         category: activeTab,
         include_inactive: false
      };

      if (activeFilter !== "all") {
        params.status = activeFilter;
      }
      
      if (search) {
          params.search = search;
      }

      const response = await inventoryAPI.getAll(params);
      
      if (response.success) {
          setItems(response.data);
          setSummary(response.summary);
      }
      
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, activeFilter, search]); // Re-fetch when these change

  const handleUpdateStock = async (item, operation) => {
      // Simple prompt for now, or use a modal.
      // Let's just add/subtract 1 for quick action or prompt for number.
      // ideally a small popover but prompt is easier for MVP.
      const change = prompt(`Enter quantity to ${operation} for ${item.itemname}:`, "1");
      if (!change || isNaN(change)) return;
      
      try {
          await inventoryAPI.updateQuantity(item.id, {
              quantity_change: parseInt(change),
              operation: operation
          });
          fetchData(); // Refresh
      } catch (err) {
          alert("Failed to update stock: " + err.message);
      }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="inventory-page">
          <div className="inventory-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h5>← Inventory Tracking</h5>
              <button className="primary-btn" onClick={() => setShowAddModal(true)}>+ Add Item</button>
          </div>

          {/* Search */}
          <div className="inventory-search">
            <input 
                placeholder="Search items..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <span>🔍</span>
          </div>

          {/* Tabs */}
          <InventoryTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Stats - Global or Tab specific? API returns summary for fetched fetch. 
             If we want global stats we might need a separate call, but current summary is fine.*/}
          {!loading && <InventoryStats summary={summary} lowStockAlerts={{
              out_of_stock: items.filter(i => i.currentquantity === 0).length,
              total_low_stock: items.filter(i => i.currentquantity <= i.minimumthreshold).length
          }} />}

          {/* Filters */}
          <InventoryFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

          {/* List */}
          {loading ? (
              <div className="loading">Loading inventory...</div>
          ) : (
              <InventoryList items={items} onUpdate={handleUpdateStock} />
          )}
        </div>
        
        {showAddModal && (
            <AddItemModal 
                onClose={() => setShowAddModal(false)}
                onAdd={() => { fetchData(); }}
            />
        )}
      </div>
    </div>
  );
};

export default InventoryTracking;
