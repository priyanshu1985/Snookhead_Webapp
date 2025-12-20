const InventoryList = ({ activeTab }) => {
  const name =
    activeTab === "cafe"
      ? "Cue stick"
      : activeTab === "packed"
      ? "Coca cola (500 ml)"
      : "Paneer";

  return (
    <div className="inventory-list">
      {[...Array(4)].map((_, i) => (
        <div className="inventory-item" key={i}>
          <div className="img"></div>

          <div className="info">
            <h6>{name}</h6>
            <p>In Stock : 24 | Threshold : 10</p>
            <span>₹50</span>
          </div>

          <div className="actions">
            <button className="restock">Restock item</button>
            <button className="call">📞 Call supplier</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryList;
