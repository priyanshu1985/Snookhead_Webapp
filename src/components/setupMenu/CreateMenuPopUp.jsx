import { useState, useEffect } from "react";
import { stockImagesAPI, IMAGE_BASE_URL } from "../../services/api";
import "../../styles/creategame.css";

const CATEGORIES = [
  { value: "Food", label: "Food" },
  { value: "Fast Food", label: "Fast Food" },
  { value: "Beverages", label: "Beverages" },
  { value: "Snacks", label: "Snacks" },
  { value: "Desserts", label: "Desserts" },
  { value: "prepared", label: "Prepared Food" },
  { value: "packed", label: "Packed Food" },
  { value: "cigarette", label: "Cigarette" },
];

const CreateMenuPopUp = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
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
        price: initialData.price || "",
        purchasePrice: initialData.purchasePrice || "",
        image_url: initialData.imageUrl || initialData.image_url || initialData.imageurl || "",
      });
    }
  }, [initialData]);

  const [stockImages, setStockImages] = useState([]);
  const [showImageSelector, setShowImageSelector] = useState(false);

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
    setShowImageSelector(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please enter item name");
      return;
    }

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    if (!formData.price) {
      alert("Please enter price");
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
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
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Form */}
        <form className="create-game-form" onSubmit={handleSubmit}>
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

          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
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
            <label>Image (Optional)</label>
            
            {!showImageSelector ? (
              <div className="image-preview-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {formData.image_url && (
                  <div className="preview-box" style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                    <img src={formData.image_url} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <button 
                  type="button" 
                  className="secondary-btn" 
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                  onClick={() => setShowImageSelector(true)}
                >
                  {formData.image_url ? "Change Image" : "Select Image"}
                </button>
                {formData.image_url && (
                   <button 
                     type="button"
                     className="text-btn danger"
                     style={{ color: '#ff4444', fontSize: '13px', marginLeft: 'auto' }}
                     onClick={() => setFormData(prev => ({...prev, image_url: ""}))}
                   >
                     Remove
                   </button>
                )}
              </div>
            ) : (
              <div className="stock-image-selector" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '10px', marginTop: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>Select an image:</span>
                  <button type="button" onClick={() => setShowImageSelector(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </div>
                <div className="image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                  {stockImages.map((img) => (
                    <div 
                      key={img.key} 
                      onClick={() => selectImage(img.url)}
                      style={{ 
                        cursor: 'pointer', 
                        border: formData.image_url === `${IMAGE_BASE_URL}${img.url}` ? '2px solid #F08626' : '1px solid #ddd',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        aspectRatio: '1/1'
                      }}
                    >
                      <img 
                        src={`${IMAGE_BASE_URL}${img.url}`} 
                        alt={img.filename} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                  ))}
                  {stockImages.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: '12px', padding: '10px', color: '#999' }}>No images found</p>}
                </div>
              </div>
            )}
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
