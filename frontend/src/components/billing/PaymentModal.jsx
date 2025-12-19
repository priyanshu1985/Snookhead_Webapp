import "../../styles/paymentModel.css";

const PaymentModal = ({ onClose }) => {
  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        {/* Header */}
        <div className="payment-header">
          <h5>Select a Payment Method</h5>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Payment Method */}
        <div className="payment-method">
          <button className="method-btn active">Cash</button>
        </div>

        {/* Bill Details */}
        <div className="payment-details">
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
        <div className="payment-inputs">
          <div>
            <label>Member ID</label>
            <input type="text" placeholder="Member ID" />
            <span className="check">Check</span>
          </div>

          <div>
            <label>Promo Code</label>
            <input type="text" placeholder="Promo Code" />
            <span className="check">Check</span>
          </div>
        </div>

        {/* QR Placeholder */}
        <div className="qr-box">
          <div className="qr-placeholder">QR</div>
        </div>

        {/* Footer */}
        <button className="pay-btn">Pay Amount</button>
      </div>
    </div>
  );
};

export default PaymentModal;
