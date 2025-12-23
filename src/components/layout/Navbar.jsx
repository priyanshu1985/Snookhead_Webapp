import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/navbar.css";

// All searchable pages/routes
const searchablePages = [
  { name: "Dashboard", path: "/", icon: "🏠", keywords: ["home", "main", "tables"] },
  { name: "Queue", path: "/bookings", icon: "⏱", keywords: ["bookings", "waiting", "line"] },
  { name: "Billing", path: "/billing", icon: "🧾", keywords: ["bills", "payment", "invoice"] },
  { name: "Food & Order", path: "/food-orders", icon: "🍔", keywords: ["food", "menu", "order", "restaurant"] },
  { name: "Owners Panel", path: "/owners", icon: "📋", keywords: ["admin", "owner", "management"] },
  { name: "Set Up Menu", path: "/setup-menu", icon: "⚙️", keywords: ["menu", "setup", "configure", "games"] },
  { name: "Inventory Tracking", path: "/inventory", icon: "📦", keywords: ["stock", "inventory", "items"] },
  { name: "Upgrade Subscription", path: "/subscription", icon: "💎", keywords: ["plan", "upgrade", "premium"] },
  { name: "Report Bugs", path: "/report-bugs", icon: "🐛", keywords: ["bug", "issue", "problem", "report"] },
  { name: "Privacy & Policy", path: "/privacy-policy", icon: "🔒", keywords: ["privacy", "policy", "terms"] },
];

const Navbar = () => {
  const { toggleSidebar } = useContext(LayoutContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  // Filter pages based on search query
  const filteredPages = searchQuery.trim()
    ? searchablePages.filter((page) => {
        const query = searchQuery.toLowerCase();
        return (
          page.name.toLowerCase().includes(query) ||
          page.keywords.some((keyword) => keyword.includes(query))
        );
      })
    : [];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults || filteredPages.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredPages.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredPages.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectPage(filteredPages[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  // Handle page selection
  const handleSelectPage = (page) => {
    navigate(page.path);
    setSearchQuery("");
    setShowResults(false);
    setSelectedIndex(-1);
  };

  return (
    <header className="topbar">
      {/* LEFT: Hamburger (mobile only) */}
      <div className="topbar-left">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* Desktop search with dropdown */}
        <div className="search-container desktop-only" ref={searchRef}>
          <input
            type="text"
            className="search-input"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
          />

          {/* Search Results Dropdown */}
          {showResults && filteredPages.length > 0 && (
            <div className="search-results">
              {filteredPages.map((page, index) => (
                <div
                  key={page.path}
                  className={`search-result-item ${index === selectedIndex ? "selected" : ""}`}
                  onClick={() => handleSelectPage(page)}
                >
                  <span className="result-icon">{page.icon}</span>
                  <span className="result-name">{page.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {showResults && searchQuery.trim() && filteredPages.length === 0 && (
            <div className="search-results">
              <div className="search-no-results">No pages found</div>
            </div>
          )}
        </div>
      </div>

      {/* CENTER NAVIGATION */}
      <nav className="topbar-center">
        <NavLink to="/" end className="nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <NavLink to="/bookings" className="nav-item">
          <span className="nav-icon">⏱</span>
          <span className="nav-text">Queue</span>
        </NavLink>

        <NavLink to="/billing" className="nav-item">
          <span className="nav-icon">🧾</span>
          <span className="nav-text">Billing</span>
        </NavLink>

        <NavLink to="/food-orders" className="nav-item">
          <span className="nav-icon">🍔</span>
          <span className="nav-text">Food & Order</span>
        </NavLink>
      </nav>

      {/* RIGHT: Desktop actions only */}
      <div className="topbar-right desktop-only">
        <button className="btn btn-warning btn-sm">Add member</button>
        <span className="date-chip">02/08/2025</span>
      </div>
    </header>
  );
};

export default Navbar;
