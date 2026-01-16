const InventoryFilters = ({ activeFilter, setActiveFilter }) => {
  return (
    <div className="inventory-filters">
      <span 
        className={activeFilter === "all" ? "active" : ""} 
        onClick={() => setActiveFilter("all")}
      >
        All
      </span>
      <span 
        className={activeFilter === "low_stock" ? "active" : ""} 
        onClick={() => setActiveFilter("low_stock")}
      >
        Low Stock
      </span>
      <span 
        className={activeFilter === "out_of_stock" ? "active" : ""} 
        onClick={() => setActiveFilter("out_of_stock")}
      >
        Out of Stock
      </span>
    </div>
  );
};

export default InventoryFilters;
