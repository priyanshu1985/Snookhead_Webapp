import { useState, useEffect, useRef } from "react";
import { menuAPI } from "../../services/api";
import CreateMenuPopUp from "./CreateMenuPopUp";
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
import "../../styles/setupMenuCardList.css";

const categories = [
  { key: "prepared", label: "Prepared Food", Icon: PreparedFoodIcon },
  { key: "packed", label: "Packed Food", Icon: PackedFoodIcon },
];

const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("prepared");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // New state for editing
  const categoriesRef = useRef(null);
  
  // Compute categories dynamically based on fetched items
  // Start with default categories as base to preserve order/icons
  // Then append any custom categories found in items
  // Compute categories dynamically based on fetched items - Strict Mode
  const computedCategories = items.reduce((acc, item) => {
    // Skip if no category
    if (!item.category) return acc;

    // Check if category already exists in accumulator
    const exists = acc.some(cat => cat.key === item.category);
    if (!exists) {
        // Use local categories config if available (for icons)
        const defaultCat = categories.find(c => c.key === item.category);
        if (defaultCat) {
             acc.push(defaultCat);
        } else {
             acc.push({
                key: item.category,
                label: item.category, // Use category name as label
                Icon: PlateIcon // Default icon for custom categories
             });
        }
    }
    return acc;
  }, []); // Seed with EMPTY array

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Fetch ALL items, including unavailable ones, for the setup menu
      const data = await menuAPI.getAll({ includeUnavailable: true });
      const itemsList = data?.data || (Array.isArray(data) ? data : []);
      setItems(itemsList);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch menu items");
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

  // Scroll active category into view
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

  const getItemsByCategory = (category) => {
    return items.filter((item) => item.category === category);
  };

  const openAddModal = () => {
    setError("");
    setEditingItem(null); // Reset editing item
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setError("");
    setEditingItem(item); // Set item to edit
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleCreateOrUpdateItem = async (payload) => {
    try {
      setError("");
      if (editingItem) {
        await menuAPI.update(editingItem.id, payload);
      } else {
        await menuAPI.create(payload);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.message || `Failed to ${editingItem ? "update" : "create"} menu item`);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await menuAPI.delete(id);
      fetchItems();
    } catch (err) {
      setError(err.message || "Failed to delete menu item");
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      // Optimistic update
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, is_available: !currentStatus } : item
        )
      );

      await menuAPI.update(id, { is_available: !currentStatus });
    } catch (err) {
      // Revert on failure
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, is_available: currentStatus } : item
        )
      );
      setError(err.message || "Failed to update availability");
    }
  };

  if (loading) {
    return (
      <div className="menu-tab">
        <div className="loading-state">
          <span className="loading-icon">
            <LoadingIcon size={40} />
          </span>
          <p>Loading menu items...</p>
        </div>
      </div>
    );
  }

  const categoryItems = getItemsByCategory(activeCategory);

  return (
    <div className="menu-tab">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Category Tabs with horizontal scroll */}
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

      {/* Menu Items List - New Card Design */}
      <div className="setup-card-list">
        {/* Header Row */}
        {categoryItems.length > 0 && (
          <div className="setup-list-header">
            <span>#</span>
            <span style={{ flex: 2 }}>Item Details</span>
            <span>Availability</span>
            <span style={{ justifyContent: "flex-end" }}>Actions</span>
          </div>
        )}

        {categoryItems.length === 0 ? (
          <div className="no-data">
            <span className="no-data-icon">
              <PlateIcon size={48} />
            </span>
            <p>No items in this category yet.</p>
            <small>Add your first item using the button below</small>
          </div>
        ) : (
          categoryItems.map((item, index) => {
            const isAvailable = item.is_available ?? true;
            
            return (
              <div className="setup-card-item" key={item.id || `item-${index}`}>
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
                    <span className="separator">•</span>
                    <span>{item.unit || 'piece'}</span>
                  </div>
                </div>

                {/* Availability Toggle Section */}
                <div className="setup-card-status">
                   <span className={`status-badge ${isAvailable ? 'status-available' : 'status-maintenance'}`}>
                      {isAvailable ? 'Available' : 'Unavailable'}
                   </span>
                   <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={isAvailable} 
                        onChange={() => handleToggleAvailability(item.id, isAvailable)}
                      />
                      <span className="slider round"></span>
                   </label>
                </div>

                <div className="setup-card-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => openEditModal(item)}
                    title="Edit"
                  >
                    <EditIcon size={16} />
                  </button>
                  <button 
                    className="action-btn delete" 
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete"
                  >
                    <DeleteIcon size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="add-btn center" onClick={openAddModal}>
        + Add New Item
      </button>

      {/* Create Menu Item Popup */}
      {showModal && (
        <CreateMenuPopUp
          onClose={closeModal}
          onSubmit={handleCreateOrUpdateItem}
          initialData={editingItem}
        />
      )}
    </div>
  );
};

export default MenuItems;
