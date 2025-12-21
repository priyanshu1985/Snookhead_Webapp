import "../../styles/billHistoryModal.css";

const BillHistoryModal = ({ bill, onClose }) => {
  // Calculate totals from bill data
  const tableCharges = Number(bill?.table_charges || 0);
  const menuCharges = Number(bill?.menu_charges || 0);
  const totalAmount = Number(bill?.total_amount || 0);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB");
  };

  return (
    <div className="history-overlay">
      <div className="history-modal">
        {/* Header */}
        <div className="history-header">
          <h5>Amount Paid Successfully!</h5>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Bill Info */}
        <div className="bill-info">
          <span className="bill-number">{bill?.bill_number}</span>
          <span className="customer-name">{bill?.customer_name}</span>
          <span className="paid-date">Paid on: {formatDate(bill?.updatedAt)}</span>
        </div>

        {/* Payment Method */}
        <div className="history-method">
          <button className="method-btn">Cash</button>
        </div>

        {/* Bill Details */}
        <div className="history-details">
          {tableCharges > 0 && (
            <div>
              <span>Table Charges</span>
              <span>₹ {tableCharges.toFixed(2)}</span>
            </div>
          )}
          {menuCharges > 0 && (
            <div>
              <span>Food/Menu</span>
              <span>₹ {menuCharges.toFixed(2)}</span>
            </div>
          )}

          {/* Order Items */}
          {bill?.order_items && bill.order_items.length > 0 && (
            <div className="order-items-section">
              <span className="section-title">Items:</span>
              {bill.order_items.map((item, idx) => (
                <div key={idx} className="order-item-row">
                  <span>{item.name || item.item_name} x{item.qty || 1}</span>
                  <span>₹ {Number(item.amount || item.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="total">
            <strong>Total</strong>
            <strong>₹ {totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        {/* Member & Promo */}
        <div className="history-inputs">
          <div>
            <label>Member</label>
            <input type="text" value={bill?.member_id || "----"} disabled />
          </div>

          <div>
            <label>Promo Code</label>
            <input type="text" value={bill?.promo_code || "----"} disabled />
          </div>
        </div>

        {/* Table Info */}
        {bill?.table_info && (
          <div className="table-info-section">
            <span>Table: {bill.table_info.name}</span>
            {bill.table_info.game_name && (
              <span>Game: {bill.table_info.game_name}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <button className="paid-btn" disabled>
          Paid
        </button>
      </div>
    </div>
  );
};

export default BillHistoryModal;
