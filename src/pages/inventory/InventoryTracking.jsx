
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
  { key: "packed", label: "Packed Food", Icon: PackedFoodIcon },
];

const InventoryTracking = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("packed");
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



  const [activeSubCategory, setActiveSubCategory] = useState("All");


  const { subCategories, groupedItems } = (() => {
      // 1. Filter by Active Main Category (Prepared / Packed)
      const mainFiltered = items.filter(item => {
          const type = item.item_type || 'prepared';
          return type === activeCategory;
      });

      // 2. Get available sub-categories for this main category
      const availableSubCats = new Set(mainFiltered.map(i => i.category || 'Uncategorized'));
      const subCats = Array.from(availableSubCats).sort();

      // 3. Determine meaningful active sub-category
      // If "All" or invalid, default to first available
      let currentActive = activeSubCategory;
      if (currentActive === "All" || !subCats.includes(currentActive)) {
           if (subCats.length > 0) {
               currentActive = subCats[0];
               // Side-effect: Sync state (in render this is risky, but for derived view it's ok)
               // Better: just use currentActive for filtering, and useEffect will sync activeSubCategory
           }
      }

      // 4. Filter by Sub-Category
      let subCatFiltered = mainFiltered;
      if (currentActive) {
          subCatFiltered = mainFiltered.filter(item => (item.category || 'Uncategorized') === currentActive);
      }

      // 5. Filter by Search
      const searchFiltered = search 
          ? subCatFiltered.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
          : subCatFiltered;

      // 6. Group by Sub-Category
      const groups = {};
      searchFiltered.forEach(item => {
          const cat = item.category || 'Uncategorized';
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(item);
      });

      return { subCategories: subCats, groupedItems: groups };
  })();

  // Sync activeSubCategory when main category changes or if it becomes invalid
  useEffect(() => {
      if (subCategories.length > 0 && (!activeSubCategory || !subCategories.includes(activeSubCategory) || activeSubCategory === "All")) {
          setActiveSubCategory(subCategories[0]);
      }
  }, [activeCategory, subCategories, activeSubCategory]);

  const hasItems = Object.keys(groupedItems).length > 0;

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

              {/* Top Level Tabs: Prepared vs Packed */}
              <div className="menu-categories-wrapper">
                <div className="menu-categories">
                  {categories.map((cat) => {
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

              {/* Sub-Category Horizontal Scrollable List */}
              {subCategories.length > 0 && (
                <div className="sub-categories-wrapper" style={{ 
                    overflowX: 'auto', 
                    whiteSpace: 'nowrap', 
                    marginBottom: '20px',
                    paddingBottom: '5px' 
                }}>
                    {subCategories.map(subCat => (
                        <button 
                            key={subCat}
                            onClick={() => setActiveSubCategory(subCat)}
                            style={{
                                padding: '8px 16px',
                                marginRight: '10px',
                                borderRadius: '20px',
                                border: '1px solid #eee',
                                background: activeSubCategory === subCat ? '#f08626' : '#fff',
                                color: activeSubCategory === subCat ? '#fff' : '#666',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                        >
                            {subCat}
                        </button>
                    ))}
                </div>
              )}

              {loading ? (
                <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
                  <LoadingIcon size={40} />
                  <p>Loading inventory...</p>
                </div>
              ) : (
                <div className="setup-card-list">
                  {!hasItems ? (
                     <div className="no-data" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        <p>No items found in this category.</p>
                     </div>
                  ) : (
                    Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
                        <div key={categoryName} style={{ marginBottom: '30px' }}>
                            {/* Removed Header as per request */}
                            
                            <div className="setup-list-header">
                              <span style={{ width: '40px' }}>#</span>
                              <span style={{ flex: 2 }}>Item Details</span>
                              <span style={{ width: '120px', textAlign: 'center' }}>Current Stock</span>
                              <span style={{ width: '150px', justifyContent: 'flex-end', textAlign: 'right' }}>Actions</span>
                            </div>

                            {categoryItems.map((item, index) => {
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
                            })}
                        </div>
                    ))
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
