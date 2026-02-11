import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import PaymentModal from "../../components/billing/PaymentModal";
import BillHistoryModal from "../../components/billing/BillHistoryModal";
import { billingAPI, gamesAPI } from "../../services/api"; // Added gamesAPI
import { LayoutContext } from "../../context/LayoutContext";

import "../../styles/billing.css";

const Billing = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const location = useLocation(); // Hook to access navigation state
  const [activeTab, setActiveTab] = useState("active");
  const [showPayment, setShowPayment] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Success Animation State
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New Filter & Sort State
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // Highlighted Bill State
  const [highlightedId, setHighlightedId] = useState(null);

  // Check for success state from navigation
  useEffect(() => {
    if (location.state?.billGenerated) {
      setShowSuccessAnimation(true);

      // Set highlighted bill if ID is provided
      if (location.state.newBillId) {
        setHighlightedId(location.state.newBillId);
        // Remove highlight after 5 seconds
        setTimeout(() => setHighlightedId(null), 5000);
      }

      // Set active tab if provided (for fully paid bills)
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }

      // Hide animation after 2 seconds
      const timer = setTimeout(() => {
        setShowSuccessAnimation(false);
        // Clean up state history
        window.history.replaceState({}, document.title);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Fetch bills AND games from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsData, gamesData] = await Promise.all([
        billingAPI.getAll(),
        gamesAPI.getAll(),
      ]);

      const billsList = Array.isArray(billsData) ? billsData : [];
      const gamesList =
        gamesData?.data || (Array.isArray(gamesData) ? gamesData : []);

      setBills(billsList);
      setGames(gamesList);
      setError("");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter bills by status
  const activeBills = bills.filter((bill) => bill.status === "pending");
  const paidBills = bills.filter((bill) => bill.status === "paid");

  // Search and Date Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const currentTabBills = activeTab === "active" ? activeBills : paidBills;

  const billsToRender = currentTabBills
    .filter((bill) => {
      // Search by Name or Bill Number
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (bill.customer_name || "").toLowerCase().includes(searchLower) ||
        (bill.bill_number || "").toLowerCase().includes(searchLower);

      // Filter by Date
      let matchesDate = true;
      if (dateFilter) {
        const billDate = new Date(bill.createdAt).toISOString().split("T")[0];
        matchesDate = billDate === dateFilter;
      }

      // Filter by Game
      let matchesGame = true;
      if (selectedGame !== "All") {
        // Normalize names for comparison
        const billGame = (bill.table_info?.game_name || "").toLowerCase();
        matchesGame = billGame === selectedGame.toLowerCase();
      }

      return matchesSearch && matchesDate && matchesGame;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  // Get tags from bill items
  const getTags = (bill) => {
    const tags = [];
    if (
      bill.table_info?.game_name &&
      bill.table_info.game_name !== "Unknown Game"
    ) {
      tags.push(bill.table_info.game_name);
    }
    if (bill.items_summary) {
      const items = bill.items_summary.split(", ").slice(0, 3);
      tags.push(...items);
    }
    return tags.length > 0 ? tags : ["Bill"];
  };

  // Handle view bill click
  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    if (activeTab === "active") {
      setShowPayment(true);
    } else {
      setShowHistoryModal(true);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedBill(null);
    fetchData(); // Refresh bills list
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div
        className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`}
      />

      <div className="dashboard-main">
        <Navbar />

        <div className="billing-page">
          <h5 className="mb-3">Bill Management</h5>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Tabs */}
          <div className="billing-tabs">
            <button
              className={activeTab === "active" ? "active" : ""}
              onClick={() => setActiveTab("active")}
            >
              ACTIVE BILLS ({activeBills.length})
            </button>

            <button
              className={activeTab === "history" ? "active" : ""}
              onClick={() => setActiveTab("history")}
            >
              BILL HISTORY ({paidBills.length})
            </button>
          </div>

          {/* Filters Bar */}
          <div
            className="filters-bar"
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "15px",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ flex: 1, minWidth: "150px" }}
            />

            {/* Game Filter */}
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="form-control"
              style={{ width: "auto", minWidth: "120px", cursor: "pointer" }}
            >
              <option value="All">All Games</option>
              {games.map((game) => (
                <option
                  key={game.id || game.gameid}
                  value={game.gamename || game.name}
                >
                  {game.gamename || game.name}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-control"
              style={{ width: "auto" }}
            />

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-control"
              style={{ width: "auto", cursor: "pointer" }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>

            {(searchQuery || dateFilter || selectedGame !== "All") && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setDateFilter("");
                  setSelectedGame("All");
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* List */}
          <div className="billing-list">
            {loading ? (
              <p className="loading-text">Loading bills...</p>
            ) : billsToRender.length === 0 ? (
              <p className="empty-text">
                {activeTab === "active"
                  ? "No active bills found"
                  : "No bill history found"}
              </p>
            ) : (
              billsToRender.map((bill, index) => {
                // Check if this is the highlighted bill
                const isHighlighted =
                  highlightedId &&
                  (String(bill.id) === String(highlightedId) ||
                    String(bill._id) === String(highlightedId) ||
                    String(bill.bill_number) === String(highlightedId));

                return (
                  <div
                    className={`billing-item ${isHighlighted ? "blink-highlight" : ""}`}
                    key={bill.id}
                  >
                    {/* Left */}
                    <div className="billing-left">
                      <span className="index">{index + 1}.</span>
                      <div>
                        <small className="date">
                          {formatDate(bill.createdAt)}
                        </small>
                        <div className="name">
                          {bill.customer_name || "Customer"}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="billing-tags">
                      {getTags(bill).map((tag, i) => (
                        <span className="tag" key={i}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Amount */}
                    <div className="billing-amount">
                      ₹{Number(bill.total_amount || 0).toFixed(2)}
                    </div>

                    {/* Action */}
                    <button
                      className={
                        activeTab === "active"
                          ? "view-bill-btn"
                          : "view-bill-btn history"
                      }
                      onClick={() => handleViewBill(bill)}
                    >
                      View Bill
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Payment Popup (Active Bills only) */}
      {showPayment && selectedBill && (
        <PaymentModal
          bill={selectedBill}
          onClose={() => {
            setShowPayment(false);
            setSelectedBill(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {showHistoryModal && selectedBill && (
        <BillHistoryModal
          bill={selectedBill}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedBill(null);
          }}
        />
      )}

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="success-animation-overlay">
          <div className="success-content">
            <div className="checkmark-circle">
              <div className="checkmark draw"></div>
            </div>
            <h3>Bill Generated!</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
