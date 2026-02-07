import { useState, useEffect, useRef } from "react";
import { menuAPI } from "../../services/api";
import CreateMenuPopUp from "./CreateMenuPopUp";
import CreateCategoryModal from "./CreateCategoryModal";
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
  EditIcon,
  DeleteIcon,
} from "../common/Icons";
import ConfirmationModal from "../common/ConfirmationModal";
import "../../styles/setupMenuCardList.css";

const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const categoriesRef = useRef(null);

  // Confirmation Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Main types (Tabs)
  const ITEM_TYPES = [
    { key: "prepared", label: "Prepared Food", Icon: PreparedFoodIcon },
    { key: "packed", label: "Packed Food", Icon: PackedFoodIcon },
  ];

  const [activeType, setActiveType] = useState("prepared");
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter items by active Type first
  const typeItems = items.filter(item => (item.item_type || 'prepared') === activeType);
  
  // Group items by sub-category for display
  const groupedItems = typeItems.reduce((acc, item) => {
      const cat = item.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
  }, {});

  // Combine derived categories with any newly created temporary categories
  const [tempCategories, setTempCategories] = useState([]);
  
  const allCategoryNames = new Set([
      ...Object.keys(groupedItems),
      ...tempCategories.filter(tc => tc.type === activeType).map(tc => tc.name)
  ]);
  
  const sortedCategories = Array.from(allCategoryNames).sort();
  
  // Reset activeCategory when type changes
  useEffect(() => {
     if (sortedCategories.length > 0) {
         // Try to keep current if valid, else first
         if (!sortedCategories.includes(activeCategory)) {
             setActiveCategory(sortedCategories[0]);
         }
     } else {
         setActiveCategory("");
     }
  }, [activeType, items, tempCategories]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await menuAPI.getAll();
      setItems(data || []);
      setError("");
    } catch (err) {
      setError("Failed to load menu items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);
  
  const handleCreateOrUpdateItem = async (formData) => {
    try {
      if (editingItem && editingItem.id) {
        await menuAPI.update(editingItem.id, formData);
      } else {
        await menuAPI.create(formData);
      }
      fetchItems();
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Failed to save item");
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await menuAPI.update(id, { is_available: !currentStatus });
      // Optimistic update
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_available: !currentStatus } : item
      ));
    } catch (err) {
      console.error(err);
      fetchItems(); // Revert on fail
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await menuAPI.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete item");
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // Category Creation Logic
  const handleCreateCategory = (name, type) => {
      // 1. Add to temp categories so it appears in the tab immediately
      setTempCategories(prev => [...prev, { name, type }]);
      
      // 2. Switch to that type if not active
      if (activeType !== type) {
          setActiveType(type);
      }
      
      // 3. Set as active category
      setActiveCategory(name);
      
      // 4. Close category modal
      setShowCategoryModal(false);

      // 5. Open Item Modal to populate it (User request implies "category should be created", 
      // but to persist we need an item. Opening the modal is the best way to prompt that next step).
      // If we don't open the item modal, the category is just an empty tab until they add something.
      // Let's open the modal to encourage adding data.
      setEditingItem({ category: name, item_type: type });
      setShowModal(true);
  };
  
  const handleDeleteCategory = (e, categoryName) => {
      e.stopPropagation(); // Prevent activating the tab
      setCategoryToDelete(categoryName);
      setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = async () => {
      if (!categoryToDelete) return;
      
      const categoryName = categoryToDelete;
      
      try {
          // Identify items to delete
          const itemsToDelete = items.filter(item => item.category === categoryName);
          
          if (itemsToDelete.length > 0) {
              setLoading(true);
              // Delete all items sequentially to avoid overwhelming server or hitting rate limits
              await Promise.all(itemsToDelete.map(item => menuAPI.delete(item.id)));
          }
          
          // Update items state
          setItems(prev => prev.filter(item => item.category !== categoryName));
          
          // Also remove from tempCategories if it was just created and empty
          setTempCategories(prev => prev.filter(tc => tc.name !== categoryName));
          
          // If active, switch to another or clear
          if (activeCategory === categoryName) {
              const remaining = sortedCategories.filter(c => c !== categoryName);
              setActiveCategory(remaining.length > 0 ? remaining[0] : "");
          }
          
      } catch (err) {
          console.error("Failed to delete category:", err);
          alert("Failed to delete category. Some items might not have been deleted.");
          fetchItems(); // Refresh to be sure
      } finally {
          setLoading(false);
          setShowDeleteConfirm(false);
          setCategoryToDelete(null);
      }
  };
  
  // Categories to display
  const displayCategories = activeCategory ? [activeCategory] : [];


  return (
    <div className="menu-tab">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Main Type Tabs */}
      <div className="menu-categories-wrapper" style={{ padding: '0', marginBottom: '10px' }}>
        <div className="menu-categories" ref={categoriesRef} style={{ gap: '10px', padding: '0' }}>
          {ITEM_TYPES.map((type) => {
            const IconComponent = type.Icon;
            const isActive = activeType === type.key;
            return (
              <span
                key={type.key}
                className={isActive ? "active" : ""}
                onClick={() => setActiveType(type.key)}
                style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? '#F08626' : '#fff',
                    color: isActive ? '#fff' : '#4b5563',
                    border: isActive ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 2px 5px rgba(240, 134, 38, 0.2)' : 'none'
                }}
              >
                <span className="category-icon" style={{ display: 'flex', alignItems: 'center' }}>
                  <IconComponent size={16} />
                </span>
                <span className="category-label">{type.label}</span>
              </span>
            );
          })}

          {/* Add Sub Category Button */}
          <button
            onClick={() => setShowCategoryModal(true)}
            style={{
                marginLeft: '10px',
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                background: '#F08626',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
            }}
            title="Add New Sub-Category"
          >
            + New Category
          </button>
        </div>
      </div>
      
      {/* Sub-Category Horizontal Tabs */}
      {sortedCategories.length > 0 && (
          <div className="subcategory-tabs" style={{ 
              display: 'flex', 
              gap: '8px', /* Reduced gap */
              overflowX: 'auto', 
              padding: '5px 0', /* Reduced padding */
              borderBottom: '1px solid #f0f0f0',
              marginBottom: '10px', /* Reduced margin */
              scrollbarWidth: 'none' 
          }}>
              {sortedCategories.map(cat => (
                  <div    
                      key={cat}
                      className={`subcat-pill ${activeCategory === cat ? "active" : ""}`}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                          padding: '4px 8px 4px 12px', /* Adjusted padding for delete btn */
                          borderRadius: '16px',
                          border: 'none',
                          background: activeCategory === cat ? '#F08626' : '#f3f4f6',
                          color: activeCategory === cat ? 'white' : '#4b5563',
                          fontSize: '11px', 
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: activeCategory === cat ? '0 1px 3px rgba(240, 134, 38, 0.3)' : 'none',
                          transition: 'all 0.2s',
                          height: '28px', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                      }}
                  >
                      <span>{cat}</span>
                      {/* Delete Category Button */ }
                      <span 
                          onClick={(e) => handleDeleteCategory(e, cat)}
                          title="Delete Category"
                          style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: activeCategory === cat ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                              color: activeCategory === cat ? '#fff' : '#666',
                              fontSize: '14px',
                              lineHeight: '1',
                              cursor: 'pointer'
                          }}
                          className="hover-bright"
                      >
                          &times;
                      </span>
                  </div>
              ))}
          </div>
      )}
      
      {/* Sub-Category Grouping Display */}
      <div className="setup-card-list">
          
         {sortedCategories.length === 0 ? (
          <div className="no-data">
             <span className="no-data-icon"><PlateIcon size={48} /></span>
             <p>No items in {activeType === 'prepared' ? 'Prepared' : 'Packed'} Food.</p>
             <small>Add your first item using the button below</small>
          </div>
         ) : (
             displayCategories.map(subCat => (
                 <div key={subCat} className="sub-category-group" style={{ marginBottom: '15px' }}>
                     
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '15px' }}>
                         {/* List Items for this SubCat */}
                         {(groupedItems[subCat] || []).map((item, index) => {
                            const isAvailable = item.is_available ?? true;
                            return (
                              <div className="setup-card-item" key={item.id || `item-${index}`} style={{ 
                                  margin: 0, 
                                  padding: '12px 14px', 
                                  minHeight: 'auto', 
                                  borderLeftWidth: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                              }}>
                                <div className="setup-card-details" style={{ flex: 1, minWidth: 0, marginRight: '10px' }}>
                                  <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span className="card-icon-small" style={{ 
                                        background: '#fff3e0', 
                                        color: '#F08626', 
                                        width: '24px', 
                                        height: '24px', 
                                        padding: '4px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                      <PlateIcon size={14} />
                                    </span>
                                    <h6 style={{ fontSize: '15px', margin: 0, lineHeight: '1.2', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h6>
                                  </div>
                                  <div className="card-subtitle-row" style={{ fontSize: '12px', marginLeft: '32px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: '#333' }}>₹{item.price}</span>
                                    <span className="separator" style={{ margin: '0 6px', color: '#ccc' }}>•</span>
                                    <span style={{ color: '#666' }}>{item.unit || 'piece'}</span>
                                  </div>
                                </div>
                
                                {/* Right Side: Toggle + Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                    {/* Availability Toggle Section */}
                                    <div className="setup-card-status" style={{ margin: 0 }}>
                                       <label className="toggle-switch" style={{ width: '40px', height: '22px', margin: 0 }}>
                                          <input 
                                            type="checkbox" 
                                            checked={isAvailable} 
                                            onChange={() => handleToggleAvailability(item.id, isAvailable)}
                                          />
                                          <span className="slider round"></span>
                                       </label>
                                    </div>
                    
                                    <div className="setup-card-actions" style={{ display: 'flex', gap: '8px' }}>
                                      <button 
                                        className="action-btn edit"
                                        onClick={() => openEditModal(item)}
                                        title="Edit"
                                        style={{ 
                                            width: '34px', 
                                            height: '34px', 
                                            borderRadius: '8px',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            border: '1px solid #ffe0b2',
                                            background: 'white',
                                            color: '#f08626',
                                            cursor: 'pointer'
                                        }}
                                      >
                                        <EditIcon size={16} />
                                      </button>
                                      <button 
                                        className="action-btn delete" 
                                        onClick={() => handleDeleteItem(item.id)}
                                        title="Delete"
                                        style={{ 
                                            width: '34px', 
                                            height: '34px', 
                                            borderRadius: '8px',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            border: '1px solid #ffcdd2',
                                            background: 'white',
                                            color: '#ef4444',
                                            cursor: 'pointer'
                                        }}
                                      >
                                        <DeleteIcon size={16} />
                                      </button>
                                    </div>
                                </div>
                              </div>
                            );
                         })}
                     </div>
                 </div>
             ))
         )}

      </div>

      <button className="add-btn center" onClick={openAddModal}>
        + Add New Item
      </button>

      {/* Create Category Modal */}
      {showCategoryModal && (
          <CreateCategoryModal 
              onClose={() => setShowCategoryModal(false)}
              onConfirm={handleCreateCategory}
              initialType={activeType}
          />
      )}

      {/* Create Menu Item Popup */}
      {showModal && (
        <CreateMenuPopUp
          onClose={closeModal}
          onSubmit={handleCreateOrUpdateItem}
          initialData={editingItem || { item_type: activeType, category: activeCategory !== 'All' ? activeCategory : '' }}
          categories={sortedCategories}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Category?"
        message={`Are you sure you want to delete the "${categoryToDelete}" category? This will PERMANENTLY DELETE ALL ${groupedItems[categoryToDelete]?.length || 0} items in it.`}
        onConfirm={confirmDeleteCategory}
        confirmText="Delete Everything"
        cancelText="Cancel"
        type="alert"
      />
    </div>
  );
};

export default MenuItems;
