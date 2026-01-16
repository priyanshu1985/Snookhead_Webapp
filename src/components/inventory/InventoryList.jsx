import { getGameImageUrl } from "../../services/api";

const InventoryList = ({ items, onUpdate }) => {
  if (!items || items.length === 0) {
    return <div className="no-items">No items found in this category.</div>;
  }

  return (
    <div className="inventory-list">
      {items.map((item) => (
        <div className="inventory-item" key={item.id}>
          <div className="img">
            {/* Placeholder icon or image */}
            <span style={{fontSize: "24px"}}>📦</span>
          </div>

          <div className="info">
            <h6>{item.itemname}</h6>
            <p>
               In Stock : <span className={item.currentquantity <= item.minimumthreshold ? "low-stock-text" : ""}>{item.currentquantity} {item.unit}</span> 
               | Threshold : {item.minimumthreshold}
            </p>
            {item.costperunit && <span>₹{item.costperunit}</span>}
          </div>

          <div className="actions">
            <button className="restock" onClick={() => onUpdate(item, "add")}>+ Add Stock</button>
            <button className="call" onClick={() => onUpdate(item, "subtract")}>- Use</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryList;
