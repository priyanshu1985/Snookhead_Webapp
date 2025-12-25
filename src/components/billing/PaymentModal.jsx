import { useState } from "react";
import { billingAPI } from "../../services/api";
import "../../styles/paymentModel.css";

const PaymentModal = ({ bill, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Calculate totals from bill data
  const tableCharges = Number(bill?.table_charges || 0);
  const menuCharges = Number(bill?.menu_charges || 0);
  const totalAmount = Number(bill?.total_amount || 0);
  const sessionDuration = bill?.session_duration || 0;
  const orderItems = bill?.order_items || [];

  // Handle pay button click
  const handlePay = async () => {
    try {
      setProcessing(true);
      setError("");

      await billingAPI.pay(bill.id, { paymentMethod });

      onPaymentSuccess?.();
    } catch (err) {
      console.error("Payment failed:", err);
      setError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        {/* Header */}
        <div className="payment-header">
          <h5>Select a Payment Method</h5>
          <button className="close-btn" onClick={onClose} disabled={processing}>
            ×
          </button>
        </div>

        {error && <div className="payment-error">{error}</div>}

        {/* Bill Info */}
        <div className="bill-info">
          <span className="bill-number">{bill?.bill_number}</span>
          <span className="customer-name">{bill?.customer_name}</span>
        </div>

        {/* Payment Method */}
        <div className="payment-method">
          <button
            className={`method-btn ${paymentMethod === "cash" ? "active" : ""}`}
            onClick={() => setPaymentMethod("cash")}
            disabled={processing}
          >
            Cash
          </button>
          <button
            className={`method-btn ${paymentMethod === "online" ? "active" : ""}`}
            onClick={() => setPaymentMethod("online")}
            disabled={processing}
          >
            Online
          </button>
        </div>

        {/* Bill Details - Calculation Breakdown */}
        <div className="payment-details">
          {/* Table Charges Section */}
          {tableCharges > 0 && (
            <div className="charges-section">
              <div className="section-header">
                <span className="section-title">Table Charges</span>
                <span className="section-total">₹ {tableCharges.toFixed(2)}</span>
              </div>
              {sessionDuration > 0 && (
                <div className="charge-detail">
                  <span>Session Duration: {sessionDuration} mins</span>
                </div>
              )}
            </div>
          )}

          {/* Food Items Section */}
          {orderItems.length > 0 && (
            <div className="charges-section">
              <div className="section-header">
                <span className="section-title">Food & Beverages</span>
                <span className="section-total">₹ {menuCharges.toFixed(2)}</span>
              </div>
              {orderItems.map((item, idx) => (
                <div key={idx} className="order-item-row">
                  <span>{item.name || item.item_name} x{item.qty || 1}</span>
                  <span>₹ {Number(item.amount || item.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Calculation Summary */}
          <div className="calculation-summary">
            {tableCharges > 0 && (
              <div className="summary-row">
                <span>Table Charges</span>
                <span>₹ {tableCharges.toFixed(2)}</span>
              </div>
            )}
            {menuCharges > 0 && (
              <div className="summary-row">
                <span>Food & Beverages</span>
                <span>₹ {menuCharges.toFixed(2)}</span>
              </div>
            )}
            <div className="total">
              <strong>Grand Total</strong>
              <strong>₹ {totalAmount.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Member & Promo */}
        <div className="payment-inputs">
          <div>
            <label>Member ID</label>
            <input type="text" placeholder="Member ID" disabled={processing} />
            <span className="check">Check</span>
          </div>

          <div>
            <label>Promo Code</label>
            <input type="text" placeholder="Promo Code" disabled={processing} />
            <span className="check">Check</span>
          </div>
        </div>

        {/* QR Placeholder (for online payment) */}
        {paymentMethod === "online" && (
          <div className="qr-box">
            <div className="qr-placeholder">QR</div>
          </div>
        )}

        {/* Footer */}
        <button
          className="pay-btn"
          onClick={handlePay}
          disabled={processing}
        >
          {processing ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
