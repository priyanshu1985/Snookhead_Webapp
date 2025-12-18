import React, { useState } from "react";

const Billing = () => {
  // TODO: Replace with API call
  const mockBills = [
    {
      id: 1,
      customerName: "John Doe",
      tableId: 1,
      tableName: "Table 1",
      startTime: new Date(2025, 11, 19, 14, 0),
      endTime: new Date(2025, 11, 19, 16, 0),
      duration: 2,
      hourlyRate: 25,
      subtotal: 50,
      tax: 5,
      total: 55,
      status: "paid",
      paymentMethod: "cash",
    },
    {
      id: 2,
      customerName: "Jane Smith",
      tableId: 2,
      tableName: "Table 2",
      startTime: new Date(2025, 11, 19, 18, 0),
      endTime: null, // Currently playing
      duration: 1.5,
      hourlyRate: 25,
      subtotal: 37.5,
      tax: 3.75,
      total: 41.25,
      status: "pending",
      paymentMethod: null,
    },
  ];
  const [bills] = useState(mockBills);
  const [selectedBill, setSelectedBill] = useState(null);

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "status-paid";
      case "pending":
        return "status-pending";
      case "overdue":
        return "status-overdue";
      default:
        return "";
    }
  };

  return (
    <div className="billing-page">
      <div className="page-header">
        <h1>Billing & Payments</h1>
        <button className="btn-primary">Generate Bill</button>
      </div>

      <div className="billing-content">
        <div className="bills-list">
          <h2>Recent Bills</h2>
          {bills.map((bill) => (
            <div
              key={bill.id}
              className={`bill-card ${
                selectedBill?.id === bill.id ? "selected" : ""
              }`}
              onClick={() => setSelectedBill(bill)}
            >
              <div className="bill-header">
                <h3>Bill #{bill.id}</h3>
                <span className={`bill-status ${getStatusClass(bill.status)}`}>
                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                </span>
              </div>
              <div className="bill-summary">
                <p>
                  <strong>Customer:</strong> {bill.customerName}
                </p>
                <p>
                  <strong>Table:</strong> {bill.tableName}
                </p>
                <p>
                  <strong>Duration:</strong> {formatDuration(bill.duration)}
                </p>
                <p>
                  <strong>Total:</strong> {formatCurrency(bill.total)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedBill && (
          <div className="bill-details">
            <div className="bill-receipt">
              <h2>Bill Details - #{selectedBill.id}</h2>

              <div className="receipt-header">
                <h3>Snooker Club</h3>
                <p>Date: {selectedBill.startTime.toLocaleDateString()}</p>
                <p>Time: {selectedBill.startTime.toLocaleTimeString()}</p>
              </div>

              <div className="receipt-customer">
                <p>
                  <strong>Customer:</strong> {selectedBill.customerName}
                </p>
                <p>
                  <strong>Table:</strong> {selectedBill.tableName}
                </p>
              </div>

              <div className="receipt-items">
                <div className="receipt-item">
                  <span>
                    Table rental ({formatDuration(selectedBill.duration)})
                  </span>
                  <span>{formatCurrency(selectedBill.subtotal)}</span>
                </div>
                <div className="receipt-item">
                  <span>Tax (10%)</span>
                  <span>{formatCurrency(selectedBill.tax)}</span>
                </div>
                <div className="receipt-total">
                  <span>
                    <strong>Total Amount</strong>
                  </span>
                  <span>
                    <strong>{formatCurrency(selectedBill.total)}</strong>
                  </span>
                </div>
              </div>

              <div className="receipt-payment">
                {selectedBill.paymentMethod && (
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedBill.paymentMethod}
                  </p>
                )}
                <p>
                  <strong>Status:</strong> {selectedBill.status}
                </p>
              </div>

              <div className="bill-actions">
                <button className="btn-primary">Print Bill</button>
                <button className="btn-secondary">Send Email</button>
                {selectedBill.status === "pending" && (
                  <button className="btn-success">Mark as Paid</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
