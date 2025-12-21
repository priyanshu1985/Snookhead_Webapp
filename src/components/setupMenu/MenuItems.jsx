import { useState, useEffect } from "react";
import { menuAPI } from "../../services/api";
import CreateMenuPopUp from "./CreateMenuPopUp";

const categories = [
  { key: "prepared", label: "Prepared Food" },
  { key: "packed", label: "Packed Foods" },
  { key: "cigarette", label: "Cigarette" },
  { key: "Beverages", label: "Beverages" },
  { key: "Food", label: "Food" },
  { key: "Fast Food", label: "Fast Food" },
  { key: "Snacks", label: "Snacks" },
  { key: "Desserts", label: "Desserts" },
];

const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("prepared");
  const [showModal, setShowModal] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await menuAPI.getAll();
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

  const getItemsByCategory = (category) => {
    return items.filter((item) => item.category === category);
  };

  const openAddModal = () => {
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCreateItem = async (payload) => {
    try {
      setError("");
      await menuAPI.create(payload);
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.message || "Failed to add menu item");
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

  if (loading) {
    return <div className="menu-tab"><p>Loading menu items...</p></div>;
  }

  const categoryItems = getItemsByCategory(activeCategory);

  return (
    <div className="menu-tab">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Category Tabs */}
      <div className="menu-categories">
        {categories.map((cat) => (
          <span
            key={cat.key}
            className={activeCategory === cat.key ? "active" : ""}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </span>
        ))}
      </div>

      {/* Menu Items List */}
      <div className="menu-list">
        {categoryItems.length === 0 ? (
          <p className="no-data">No items in this category yet.</p>
        ) : (
          categoryItems.map((item, index) => (
            <div className="menu-item" key={item.id || `item-${index}`}>
              <div className="img"></div>
              <div className="info">
                <h6>{item.name}</h6>
                <span>₹{item.price}</span>
              </div>
              <div className="item-actions">
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="add-btn center" onClick={openAddModal}>
        + Add New Item
      </button>

      {/* Create Menu Item Popup */}
      {showModal && (
        <CreateMenuPopUp
          onClose={closeModal}
          onSubmit={handleCreateItem}
        />
      )}
    </div>
  );
};

export default MenuItems;
