
import { useState, useEffect, useRef, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import { menuAPI } from "../../services/api";
import {
  PreparedFoodIcon,
  PackedFoodIcon,
  CigaretteIcon,
  BeveragesIcon,
  PlateIcon,
  FastFoodIcon,
  SnacksIcon,
  DessertsIcon,
  LoadingIcon,
} from "../../components/common/Icons";
import "../../styles/inventoryTracking.css";
import "../../styles/setupMenuCardList.css";

const categories = [
  { key: "prepared", label: "Prepared Food", Icon: PreparedFoodIcon },
  { key: "packed", label: "Packed Food", Icon: PackedFoodIcon },
];

const InventoryTracking = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("prepared");
  const [search, setSearch] = useState("");
  const categoriesRef = useRef(null);

  // Compute categories dynamically - Strict Mode
  const computedCategories = items.reduce((acc, item) => {
    // Skip if no category
    if (!item.category) return acc;

    const exists = acc.some(cat => cat.key === item.category);
    if (!exists) {
        // Use local categories config if available (for icons)
        const defaultCat = categories.find(c => c.key === item.category);
        if (defaultCat) {
             acc.push(defaultCat);
        } else {
             acc.push({
                key: item.category,
                label: item.category,
                Icon: PlateIcon
             });
        }
    }
    return acc;
  }, []); // Seed with EMPTY array to only show active categories

  // Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addQuantity, setAddQuantity] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await menuAPI.getAll({ includeUnavailable: true });
      const itemsList = data?.data || (Array.isArray(data) ? data : []);
      setItems(itemsList);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch inventory items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);
  
  // Ensure active category is valid
  useEffect(() => {
    if (computedCategories.length > 0) {
        // If current active is not in list, switch to first one
        const currentExists = computedCategories.some(c => c.key === activeCategory);
        if (!currentExists) {
            setActiveCategory(computedCategories[0].key);
        }
    }
  }, [computedCategories, activeCategory]);

  useEffect(() => {
    if (categoriesRef.current) {
      const activeElement = categoriesRef.current.querySelector(".active");
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeCategory]);

  const openStockModal = (item) => {
    setSelectedItem(item);
    setAddQuantity("");
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setSelectedItem(null);
    setAddQuantity("");
  };

  const handleAddStock = async (e) => {
      e.preventDefault();
      if (!selectedItem || !addQuantity) return;

      const qty = parseInt(addQuantity);
      if (isNaN(qty) || qty <= 0) {
          alert("Please enter a valid quantity greater than 0");
          return;
      }

      try {
          // Optimistic update
          setItems(prev => prev.map(item => {
              if (item.id === selectedItem.id) {
                  return { ...item, stock: (item.stock || 0) + qty };
              }
              return item;
          }));

          await menuAPI.updateStock(selectedItem.id, qty); // Positive value adds stock
          closeStockModal();
      } catch (err) {
          console.error("Failed to add stock", err);
          alert("Failed to add stock. Please try again.");
          fetchItems(); // Revert
      }
  };


  const getFilteredItems = () => {
    let filtered = items.filter((item) => item.category === activeCategory);
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(lowerSearch)
      );
    }
    
    return filtered;
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />
      <div className="dashboard-main">
        <Navbar />

        <div className="inventory-page">
           <div className="inventory-header" style={{ marginBottom: '20px' }}>
              <h5>Inventory & Stock Tracking</h5>
           </div>

           <div className="inventory-search" style={{ marginBottom: '20px' }}>
             <input 
                 placeholder="Search items..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 style={{ 
                   width: '100%', 
                   padding: '12px', 
                   borderRadius: '8px', 
                   border: '1px solid #ddd',
                   fontSize: '14px'
                 }}
             />
           </div>

           <div className="menu-tab">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="menu-categories-wrapper">
                <div className="menu-categories" ref={categoriesRef}>
                  {computedCategories.map((cat) => {
                    const IconComponent = cat.Icon;
                    return (
                      <span
                        key={cat.key}
                        className={activeCategory === cat.key ? "active" : ""}
                        onClick={() => setActiveCategory(cat.key)}
                      >
                        <span className="category-icon">
                          <IconComponent size={18} />
                        </span>
                        <span className="category-label">{cat.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {loading ? (
                <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
                  <LoadingIcon size={40} />
                  <p>Loading inventory...</p>
                </div>
              ) : (
                <div className="setup-card-list">
                  {filteredItems.length > 0 && (
                    <div className="setup-list-header">
                      <span style={{ width: '40px' }}>#</span>
                      <span style={{ flex: 2 }}>Item Details</span>
                      <span style={{ width: '120px', textAlign: 'center' }}>Current Stock</span>
                      <span style={{ width: '150px', justifyContent: 'flex-end', textAlign: 'right' }}>Actions</span>
                    </div>
                  )}

                  {filteredItems.length === 0 ? (
                     <div className="no-data" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        <p>No items found in this category.</p>
                     </div>
                  ) : (
                    filteredItems.map((item, index) => {
                      const isLowStock = (item.stock || 0) <= (item.threshold || 5);
                      
                      return (
                        <div className="setup-card-item" key={item.id}>
                          <div className="setup-card-index">{index + 1}</div>
                          
                          <div className="setup-card-details">
                            <div className="card-title-row">
                              <span className="card-icon-small">
                                 <PlateIcon size={14} />
                              </span>
                              <h6>{item.name}</h6>
                            </div>
                            <div className="card-subtitle-row">
                              <span>₹{item.price}</span>
                              {item.purchasePrice && (
                                <>
                                  <span className="separator">•</span>
                                  <span style={{ color: '#666', fontSize: '11px' }}>Buy: ₹{item.purchasePrice}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Stock Display */}
                          <div className="setup-card-status" style={{ justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
                             <span style={{ 
                               fontSize: '18px', 
                               fontWeight: '600', 
                               color: isLowStock ? '#ff4444' : '#22c55e'
                             }}>
                               {item.stock || 0}
                             </span>
                             {isLowStock && <span style={{ fontSize: '10px', color: '#ff4444' }}>Low Stock</span>}
                          </div>

                          {/* Add Stock Action */}
                          <div className="setup-card-actions">
                            <button 
                              onClick={() => openStockModal(item)}
                              className="primary-btn"
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              + Add Stock
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
           </div>
        </div>

        {/* Add Stock Modal */}
        {showStockModal && selectedItem && (
            <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '350px' }}>
                    <div className="modal-header">
                        <h5>Restock: {selectedItem.name}</h5>
                        <button className="close-btn" onClick={closeStockModal}>×</button>
                    </div>
                    <form onSubmit={handleAddStock}>
                        <div className="form-group" style={{ margin: '20px 0' }}>
                           <label>Quantity to Add</label>
                           <input 
                              type="number" 
                              min="1" 
                              value={addQuantity} 
                              onChange={(e) => setAddQuantity(e.target.value)}
                              placeholder="Enter quantity" 
                              required
                              autoFocus 
                              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                           />
                           <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                              Current Stock: <strong>{selectedItem.stock || 0}</strong>
                           </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={closeStockModal}>Cancel</button>
                            <button type="submit" className="primary-btn">Update Stock</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default InventoryTracking;
