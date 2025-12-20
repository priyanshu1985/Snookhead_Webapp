import "../../styles/billHistoryModal.css";

const BillHistoryModal = ({ onClose }) => {
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

        {/* Payment Method */}
        <div className="history-method">
          <button className="method-btn">Cash</button>
        </div>

        {/* Bill Details */}
        <div className="history-details">
          <div>
            <span>Game</span>
            <span>₹ 610/-</span>
          </div>
          <div>
            <span>Food</span>
            <span>₹ 1000/-</span>
          </div>
          <div>
            <span>Discount</span>
            <span>-₹ 99/-</span>
          </div>
          <div>
            <span>After Discount</span>
            <span>₹ 1699/-</span>
          </div>
          <div>
            <span>Game Tax</span>
            <span>₹ 15/-</span>
          </div>
          <div>
            <span>Retail Tax</span>
            <span>₹ 9.10/-</span>
          </div>
          <div>
            <span>Rounding</span>
            <span>₹ 24.10/-</span>
          </div>

          <div className="total">
            <strong>Total</strong>
            <strong>₹ 1624.10</strong>
          </div>
        </div>

        {/* Member & Promo */}
        <div className="history-inputs">
          <div>
            <label>Member</label>
            <input type="text" value="SH06537" disabled />
          </div>

          <div>
            <label>Promo Code</label>
            <input type="text" value="----" disabled />
          </div>
        </div>

        {/* QR */}
        <div className="qr-box">
          <div className="qr-placeholder">QR</div>
        </div>

        {/* Footer */}
        <button className="paid-btn" disabled>
          Paid
        </button>
      </div>
    </div>
  );
};

export default BillHistoryModal;
