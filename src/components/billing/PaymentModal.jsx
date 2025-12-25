import { useState, useEffect } from "react";
import { billingAPI, walletsAPI } from "../../services/api";
import "../../styles/paymentModel.css";

const PaymentModal = ({ bill, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [memberChecked, setMemberChecked] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  // Calculate totals from bill data
  const tableCharges = Number(bill?.table_charges || 0);
  const menuCharges = Number(bill?.menu_charges || 0);
  const totalAmount = Number(bill?.total_amount || 0);
  const sessionDuration = bill?.session_duration || 0;
  const orderItems = bill?.order_items || [];

  // Check member wallet balance
  const handleCheckMember = async () => {
    if (!memberId.trim()) {
      setError("Please enter a Member ID");
      return;
    }

    try {
      setWalletLoading(true);
      setError("");
      const walletData = await walletsAPI.getByCustomerId(memberId);
      setWalletBalance(Number(walletData.balance || 0));
      setMemberChecked(true);
    } catch (err) {
      setError("Member not found or no wallet exists");
      setWalletBalance(null);
      setMemberChecked(false);
    } finally {
      setWalletLoading(false);
    }
  };

  // Handle pay button click
  const handlePay = async () => {
    try {
      setProcessing(true);
      setError("");

      // If wallet payment, check balance and deduct
      if (paymentMethod === "wallet") {
        if (!memberChecked || walletBalance === null) {
          setError("Please check member ID first");
          setProcessing(false);
          return;
        }

        if (walletBalance < totalAmount) {
          setError(`Insufficient wallet balance. Available: ₹${walletBalance.toFixed(2)}`);
          setProcessing(false);
          return;
        }

        // Deduct from wallet
        await walletsAPI.deductMoney(memberId, totalAmount);
      }

      // Mark bill as paid
      await billingAPI.pay(bill.id, { paymentMethod });

      onPaymentSuccess?.();
    } catch (err) {
      console.error("Payment failed:", err);
      setError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  // Reset wallet info when switching payment methods
  useEffect(() => {
    if (paymentMethod !== "wallet") {
      setMemberChecked(false);
    }
  }, [paymentMethod]);

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-header">
          <div className="header-content">
            <h5>Payment</h5>
            <p className="header-subtitle">Select payment method</p>
          </div>
          <button className="close-btn" onClick={onClose} disabled={processing}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <div className="payment-error">{error}</div>}

        {/* Bill Info */}
        <div className="bill-info">
          <div className="bill-info-row">
            <span className="bill-label">Bill No.</span>
            <span className="bill-value">{bill?.bill_number}</span>
          </div>
          <div className="bill-info-row">
            <span className="bill-label">Customer</span>
            <span className="bill-value">{bill?.customer_name}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <p className="section-label">Payment Method</p>
          <div className="methods-grid">
            <button
              className={`method-card ${paymentMethod === "cash" ? "active" : ""}`}
              onClick={() => setPaymentMethod("cash")}
              disabled={processing}
            >
              <div className="method-icon cash-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </div>
              <span className="method-name">Cash</span>
            </button>

            <button
              className={`method-card ${paymentMethod === "online" ? "active" : ""}`}
              onClick={() => setPaymentMethod("online")}
              disabled={processing}
            >
              <div className="method-icon online-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M7 15h4m6 0h2M2 10h20" />
                </svg>
              </div>
              <span className="method-name">Card/UPI</span>
            </button>

            <button
              className={`method-card ${paymentMethod === "wallet" ? "active" : ""}`}
              onClick={() => setPaymentMethod("wallet")}
              disabled={processing}
            >
              <div className="method-icon wallet-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z" />
                  <path d="M16 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
                </svg>
              </div>
              <span className="method-name">Wallet</span>
            </button>
          </div>
        </div>

        {/* Wallet Section - Show when wallet selected */}
        {paymentMethod === "wallet" && (
          <div className="wallet-section">
            <div className="member-input-row">
              <input
                type="text"
                value={memberId}
                onChange={(e) => {
                  setMemberId(e.target.value);
                  setMemberChecked(false);
                }}
                placeholder="Enter Member ID"
                disabled={processing}
              />
              <button
                className="check-btn"
                onClick={handleCheckMember}
                disabled={processing || walletLoading}
              >
                {walletLoading ? "..." : "Check"}
              </button>
            </div>

            {memberChecked && walletBalance !== null && (
              <div className={`wallet-balance-info ${walletBalance >= totalAmount ? "sufficient" : "insufficient"}`}>
                <span className="balance-label">Wallet Balance:</span>
                <span className="balance-value">₹{walletBalance.toFixed(2)}</span>
                {walletBalance < totalAmount && (
                  <span className="balance-warning">Insufficient balance</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bill Details */}
        <div className="payment-details">
          {/* Table Charges */}
          {tableCharges > 0 && (
            <div className="charges-section">
              <div className="section-header">
                <span className="section-title">Table Charges</span>
                <span className="section-total">₹{tableCharges.toFixed(2)}</span>
              </div>
              {sessionDuration > 0 && (
                <div className="charge-detail">
                  <span>Duration: {sessionDuration} mins</span>
                </div>
              )}
            </div>
          )}

          {/* Food Items */}
          {orderItems.length > 0 && (
            <div className="charges-section">
              <div className="section-header">
                <span className="section-title">Food & Beverages</span>
                <span className="section-total">₹{menuCharges.toFixed(2)}</span>
              </div>
              <div className="items-list">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span className="item-name">{item.name || item.item_name} × {item.qty || 1}</span>
                    <span className="item-price">₹{Number(item.amount || item.price || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grand Total */}
          <div className="grand-total">
            <span>Grand Total</span>
            <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Promo Code */}
        <div className="promo-section">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            disabled={processing}
          />
          <button className="apply-btn" disabled={processing || !promoCode}>
            Apply
          </button>
        </div>

        {/* QR for online payment */}
        {paymentMethod === "online" && (
          <div className="qr-section">
            <div className="qr-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="4" height="4" />
                <path d="M17 17h4v4" />
              </svg>
              <span>Scan to Pay</span>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button
          className="pay-btn"
          onClick={handlePay}
          disabled={processing || (paymentMethod === "wallet" && (!memberChecked || walletBalance < totalAmount))}
        >
          {processing ? (
            <span className="processing">
              <span className="spinner"></span>
              Processing...
            </span>
          ) : (
            `Pay ₹${totalAmount.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
