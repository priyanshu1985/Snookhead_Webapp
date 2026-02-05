import { useState, useEffect } from "react";
import { stockImagesAPI, IMAGE_BASE_URL } from "../../services/api";
import { PreparedFoodIcon, PackedFoodIcon } from "../common/Icons";
import "../../styles/creategame.css";



const CreateMenuPopUp = ({ onClose, onSubmit, initialData, categories }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    item_type: "prepared", // Default
    price: "",
    purchasePrice: "",
    image_url: "",
  });

  // Populate form if editing
  useState(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "",
        item_type: initialData.item_type || "prepared",
        price: initialData.price || "",
        purchasePrice: initialData.purchasePrice || "",
        image_url: initialData.imageUrl || initialData.image_url || initialData.imageurl || "",
      });
    }
  }, [initialData]);

  const [stockImages, setStockImages] = useState([]);


  // Fetch stock images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const images = await stockImagesAPI.getMenuImages();
        setStockImages(images || []);
      } catch (err) {
        console.error("Failed to load stock images", err);
      }
    };
    fetchImages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectImage = (imageUrl) => {
    const fullUrl = `${IMAGE_BASE_URL}${imageUrl}`;
    setFormData(prev => ({ ...prev, image_url: fullUrl }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please enter item name");
      return;
    }

    if (!formData.category) {
      alert("Please enter a sub-category");
      return;
    }

    if (!formData.price) {
      alert("Please enter price");
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category.trim(),
      item_type: formData.item_type,
      price: parseFloat(formData.price),
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      imageUrl: formData.image_url,
    };

    onSubmit?.(payload);
  };

  return (
    <div className="create-game-overlay">
      <div className="create-game-modal">
        {/* Header */}
        <div className="create-game-header">
          <h5>{initialData ? "Edit Menu Item" : "Create New Menu Item"}</h5>
          <button className="close-btn" onClick={onClose} aria-label="Close"></button>
        </div>

        {/* Form */}
        <form className="create-game-form" onSubmit={handleSubmit}>
          <div className="form-scroll-content">
          {/* Item Name */}
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Paneer Wrap"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

            {/* Hidden Item Type */}
            <input type="hidden" name="item_type" value={formData.item_type} />

           {/* Custom Category Input */}
           <div className="form-group">
            <label>Sub Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  background: '#fff'
              }}
            >
                <option value="" disabled>Select a Category</option>
                {categories && categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
          </div>

          {/* Price */}
          <div className="form-group">
            <label>Selling Price (₹) *</label>
            <input
              type="number"
              name="price"
              placeholder="0"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          {/* Purchase Price */}
          <div className="form-group">
            <label>Purchasing Price (₹)</label>
            <input
              type="number"
              name="purchasePrice"
              placeholder="0"
              min="0"
              step="0.01"
              value={formData.purchasePrice}
              onChange={handleChange}
            />
          </div>

            {/* Image Selection */}
            <div className="form-group">
              <label>Select Content Image</label>
              
              {/* Always Visible Grid */}
              <div className="image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                {stockImages.map((img) => {
                  const isSelected = formData.image_url === `${IMAGE_BASE_URL}${img.url}`;
                  return (
                    <div 
                      key={img.key} 
                      onClick={() => {
                        const fullUrl = `${IMAGE_BASE_URL}${img.url}`;
                        setFormData(prev => ({ 
                          ...prev, 
                          image_url: prev.image_url === fullUrl ? "" : fullUrl 
                        }));
                      }}
                      style={{ 
                        cursor: 'pointer', 
                        border: isSelected ? '2px solid #F08626' : '2px solid transparent',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        aspectRatio: '1/1',
                        position: 'relative',
                        background: '#f3f4f6',
                        transition: 'all 0.2s',
                        transform: isSelected ? 'scale(0.95)' : 'scale(1)'
                      }}
                      className="stock-image-item"
                    >
                      <img 
                        src={`${IMAGE_BASE_URL}${img.url}`} 
                        alt={img.filename} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isSelected ? 0.8 : 1 }} 
                      />
                      {isSelected && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <div style={{ width: '24px', height: '24px', background: '#F08626', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>✓</div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {stockImages.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: '13px', padding: '20px', color: '#9ca3af' }}>No images available</p>}
              </div>
            </div>

            </div>


          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={onClose}>
              Back
            </button>
            <button type="submit" className="submit-btn">
              {initialData ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMenuPopUp;
