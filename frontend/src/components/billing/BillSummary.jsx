import React from "react";

const BillSummary = ({ bill, onPayment, onPrint, onEmail }) => {
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const startDateTime = formatDateTime(bill.startTime);
  const endDateTime = bill.endTime ? formatDateTime(bill.endTime) : null;

  return (
    <div className="bill-summary">
      <div className="bill-header">
        <div className="business-info">
          <h2>Snooker Club</h2>
          <p>123 Club Street, City</p>
          <p>Phone: (555) 123-4567</p>
        </div>
        <div className="bill-info">
          <h3>Invoice #{bill.id}</h3>
          <p>Date: {startDateTime.date}</p>
          <p>
            Status:{" "}
            <span className={`status ${bill.status}`}>{bill.status}</span>
          </p>
        </div>
      </div>

      <div className="customer-info">
        <h4>Bill To:</h4>
        <p>
          <strong>{bill.customerName}</strong>
        </p>
        {bill.customerEmail && <p>Email: {bill.customerEmail}</p>}
        {bill.customerPhone && <p>Phone: {bill.customerPhone}</p>}
      </div>

      <div className="game-details">
        <h4>Game Details:</h4>
        <div className="detail-row">
          <span>Table:</span>
          <span>{bill.tableName}</span>
        </div>
        <div className="detail-row">
          <span>Start Time:</span>
          <span>
            {startDateTime.date} at {startDateTime.time}
          </span>
        </div>
        {endDateTime && (
          <div className="detail-row">
            <span>End Time:</span>
            <span>
              {endDateTime.date} at {endDateTime.time}
            </span>
          </div>
        )}
        <div className="detail-row">
          <span>Duration:</span>
          <span>{formatDuration(bill.duration)}</span>
        </div>
        <div className="detail-row">
          <span>Hourly Rate:</span>
          <span>{formatCurrency(bill.hourlyRate)}</span>
        </div>
      </div>

      <div className="billing-breakdown">
        <div className="breakdown-row">
          <span>Subtotal ({formatDuration(bill.duration)}):</span>
          <span>{formatCurrency(bill.subtotal)}</span>
        </div>

        {bill.discount > 0 && (
          <div className="breakdown-row discount">
            <span>Discount:</span>
            <span>-{formatCurrency(bill.discount)}</span>
          </div>
        )}

        <div className="breakdown-row">
          <span>Tax ({bill.taxRate || 10}%):</span>
          <span>{formatCurrency(bill.tax)}</span>
        </div>

        <div className="breakdown-row total">
          <span>
            <strong>Total Amount:</strong>
          </span>
          <span>
            <strong>{formatCurrency(bill.total)}</strong>
          </span>
        </div>
      </div>

      {bill.paymentMethod && (
        <div className="payment-info">
          <h4>Payment Information:</h4>
          <div className="detail-row">
            <span>Method:</span>
            <span className="payment-method">{bill.paymentMethod}</span>
          </div>
          {bill.paymentTime && (
            <div className="detail-row">
              <span>Paid At:</span>
              <span>
                {formatDateTime(bill.paymentTime).date} at{" "}
                {formatDateTime(bill.paymentTime).time}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="bill-actions">
        <button className="btn-outline" onClick={() => onPrint(bill.id)}>
          🖨 Print
        </button>
        <button className="btn-outline" onClick={() => onEmail(bill.id)}>
          📧 Email
        </button>
        {bill.status === "pending" && (
          <button className="btn-success" onClick={() => onPayment(bill.id)}>
            💳 Mark as Paid
          </button>
        )}
      </div>

      <div className="bill-footer">
        <p>Thank you for playing at Snooker Club!</p>
        <p>For support, contact us at support@snookerclub.com</p>
      </div>
    </div>
  );
};

export default BillSummary;
