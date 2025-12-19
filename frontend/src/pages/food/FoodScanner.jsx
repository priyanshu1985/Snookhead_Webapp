import React, { useState } from "react";
import "../../styles/dashboard.css";

const FoodScanner = () => {
  const [scannedItems, setScannedItems] = useState([]);
  const [scannerActive, setScannerActive] = useState(false);

  const handleStartScanning = () => {
    setScannerActive(true);
    // TODO: Implement QR/Barcode scanner functionality
    console.log("Scanner activated - feature coming soon");
  };

  const handleStopScanning = () => {
    setScannerActive(false);
  };

  const addMockItem = () => {
    const mockItems = [
      { id: 1, name: "Coffee", price: 3.5, category: "Beverages" },
      { id: 2, name: "Sandwich", price: 8.99, category: "Food" },
      { id: 3, name: "Energy Drink", price: 4.25, category: "Beverages" },
      { id: 4, name: "Pizza Slice", price: 6.5, category: "Food" },
    ];

    const randomItem = mockItems[Math.floor(Math.random() * mockItems.length)];
    setScannedItems((prev) => [
      ...prev,
      { ...randomItem, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const clearItems = () => {
    setScannedItems([]);
  };

  const getTotalPrice = () => {
    return scannedItems
      .reduce((total, item) => total + item.price, 0)
      .toFixed(2);
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1>Food & Order Scanner</h1>
        <p>Scan QR codes and barcodes for food orders</p>
      </div>

      <div className="scanner-container">
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="scanner-controls">
            <div className="scanner-status">
              <i
                className={`fas fa-circle ${
                  scannerActive ? "text-green" : "text-red"
                }`}
              ></i>
              <span>Scanner: {scannerActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="scanner-buttons">
              {!scannerActive ? (
                <button className="btn-primary" onClick={handleStartScanning}>
                  <i className="fas fa-qrcode"></i>
                  Start Scanning
                </button>
              ) : (
                <button className="btn-secondary" onClick={handleStopScanning}>
                  <i className="fas fa-stop"></i>
                  Stop Scanner
                </button>
              )}
              <button className="btn-info" onClick={addMockItem}>
                <i className="fas fa-plus"></i>
                Add Mock Item
              </button>
              <button className="btn-warning" onClick={clearItems}>
                <i className="fas fa-trash"></i>
                Clear All
              </button>
            </div>
          </div>
        </div>

        <div className="scanner-display">
          <div className="card">
            <h3>Scanned Items</h3>
            {scannedItems.length === 0 ? (
              <div className="empty-state">
                <i
                  className="fas fa-qrcode"
                  style={{
                    fontSize: "48px",
                    color: "#ddd",
                    marginBottom: "16px",
                  }}
                ></i>
                <p>No items scanned yet</p>
                <small>Scan QR codes or barcodes to add items</small>
              </div>
            ) : (
              <div className="scanned-items">
                <div className="items-list">
                  {scannedItems.map((item, index) => (
                    <div key={index} className="scanned-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <span className="item-category">{item.category}</span>
                        <span className="item-time">{item.timestamp}</span>
                      </div>
                      <div className="item-price">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Total Items: {scannedItems.length}</span>
                    <span className="total-price">
                      Total: ${getTotalPrice()}
                    </span>
                  </div>
                  <button
                    className="btn-success"
                    style={{ width: "100%", marginTop: "16px" }}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    Process Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodScanner;
