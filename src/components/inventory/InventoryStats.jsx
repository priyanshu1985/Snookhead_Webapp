const InventoryStats = () => {
  return (
    <>
      <div className="inventory-alerts">
        <div>
          Assets in maintenance <strong>03</strong>
        </div>
        <div>
          Low stock items <strong>06</strong>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="stat orange">
          24 <span>Total Assets</span>
        </div>
        <div className="stat orange">
          18 <span>Available</span>
        </div>
        <div className="stat orange">
          4 <span>Maintenance</span>
        </div>
        <div className="stat orange">
          2 <span>In Repair</span>
        </div>
      </div>
    </>
  );
};

export default InventoryStats;
