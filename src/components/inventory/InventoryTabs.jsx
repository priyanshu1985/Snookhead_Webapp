const InventoryTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="inventory-tabs">
      <button
        className={activeTab === "cafe" ? "active" : ""}
        onClick={() => setActiveTab("cafe")}
      >
        CAFE ASSET
      </button>

      <button
        className={activeTab === "packed" ? "active" : ""}
        onClick={() => setActiveTab("packed")}
      >
        PACKED FOOD
      </button>

      <button
        className={activeTab === "prepared" ? "active" : ""}
        onClick={() => setActiveTab("prepared")}
      >
        PREPARED FOOD
      </button>
    </div>
  );
};

export default InventoryTabs;
