const InventoryStats = ({ summary, lowStockAlerts }) => {
  const { total_items = 0, active_items = 0 } = summary || {};
  const { out_of_stock = 0, total_low_stock = 0 } = lowStockAlerts || {};

  return (
    <>
      <div className="inventory-alerts">
        <div>
          Out of Stock <strong>{out_of_stock}</strong>
        </div>
        <div>
          Low stock items <strong>{total_low_stock}</strong>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="stat orange">
          {total_items} <span>Total Items</span>
        </div>
        <div className="stat orange">
          {active_items} <span>Active Items</span>
        </div>
        <div className="stat orange">
          {out_of_stock} <span>Out of Stock</span>
        </div>
        <div className="stat orange">
          {total_low_stock} <span>Low Stock</span>
        </div>
      </div>
    </>
  );
};

export default InventoryStats;
