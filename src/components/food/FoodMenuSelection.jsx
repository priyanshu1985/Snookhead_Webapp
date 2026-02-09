import { useState, useEffect } from "react";
import { menuAPI, IMAGE_BASE_URL } from "../../services/api";
import {
  PlateIcon,
  PreparedFoodIcon,
  PackedFoodIcon,
  SearchIcon,
  CloseIcon,
  PlusIcon,
  MinusIcon,
  CartIcon
} from "../../components/common/Icons";
import "../../styles/foodOrder.css"; // Reuse existing styles

const categories = [
  { key: "all", label: "All", Icon: PlateIcon },
  { key: "prepared", label: "Prepared Food", Icon: PreparedFoodIcon },
  { key: "packed", label: "Packed Food", Icon: PackedFoodIcon },
];

const FoodMenuSelection = ({ onSubmit, onCancel }) => {
  // Menu items state
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  
  // Type state
  const [activeType, setActiveType] = useState("prepared"); // 'prepared' | 'packed'
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const data = await menuAPI.getAll();
        const items = data?.data || (Array.isArray(data) ? data : []);
        
        // Sanitize image URLs
        const processedItems = items.map(item => {
          if (item.imageUrl && item.imageUrl.includes('localhost:4000')) {
             const cleanUrl = item.imageUrl.replace(/https?:\/\/localhost:4000/g, IMAGE_BASE_URL);
             return { ...item, imageUrl: cleanUrl };
          }
          return item;
        });

        setMenuItems(processedItems);
        setError("");
      } catch (err) {
        console.error("Failed to fetch menu items:", err);
        setError(err.message || "Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  // Compute filtered categories based on Active Type
  const computedCategories = menuItems
    .filter(item => (item.item_type || 'prepared') === activeType)
    .reduce((acc, item) => {
      if (!item.category) return acc;
      const exists = acc.some(cat => cat.key === item.category);
      if (!exists) {
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
    }, [])
    .sort((a, b) => a.label.localeCompare(b.label));

  // Ensure active category is valid when type changes
  useEffect(() => {
    if (computedCategories.length > 0) {
        setActiveCategory(computedCategories[0].key);
    } else {
        setActiveCategory("");
    }
  }, [activeType, menuItems]);

  // Filter items by category and search
  const filteredItems = menuItems
    .filter(item => (item.item_type || 'prepared') === activeType) // Added type filter here just in case
    .filter(item => activeCategory && item.category === activeCategory)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Cart Logic
  const getItemQty = (itemId) => {
    const cartItem = cart.find(c => c.id === itemId);
    return cartItem ? cartItem.qty : 0;
  };

  const addItem = (item) => {
    const exists = cart.find((c) => c.id === item.id);
    if (exists) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id, type) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, qty: type === "inc" ? item.qty + 1 : item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  return (
    <div className="food-menu-selection" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
       {/* Error Message */}
       {error && <div className="alert alert-danger">{error}</div>}

       {/* Type Switcher */}
       <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '0 10px' }}>
          <button 
             onClick={() => setActiveType('prepared')}
             style={{
                 flex: 1,
                 padding: '12px',
                 borderRadius: '12px',
                 background: activeType === 'prepared' ? '#F08626' : '#fff',
                 color: activeType === 'prepared' ? '#fff' : '#333',
                 border: activeType === 'prepared' ? 'none' : '1px solid #ddd',
                 fontWeight: 'bold',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '10px',
                 boxShadow: activeType === 'prepared' ? '0 4px 10px rgba(240, 134, 38, 0.3)' : 'none',
                 transition: 'all 0.2s'
             }}
          >
              <PreparedFoodIcon size={20} /> Prepared Food
          </button>
          <button 
             onClick={() => setActiveType('packed')}
             style={{
                 flex: 1,
                 padding: '12px',
                 borderRadius: '12px',
                 background: activeType === 'packed' ? '#F08626' : '#fff',
                 color: activeType === 'packed' ? '#fff' : '#333',
                 border: activeType === 'packed' ? 'none' : '1px solid #ddd',
                 fontWeight: 'bold',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '10px',
                 boxShadow: activeType === 'packed' ? '0 4px 10px rgba(240, 134, 38, 0.3)' : 'none',
                 transition: 'all 0.2s'
             }}
          >
              <PackedFoodIcon size={20} /> Packed Food
          </button>
       </div>

       <div className="food-layout-split" style={{ display: 'flex', gap: '20px', padding: '0 10px', flex: 1, overflow: 'hidden' }}> 
         
         {/* LEFT SIDE: Search + Category Sidebar + Grid */}
         <div className="food-left-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
             
             {/* Search Bar */}
             <div className="food-search-container" style={{ marginBottom: '15px' }}>
                 <div className="food-search-box" style={{ width: '100%' }}>
                 <span className="search-icon"><SearchIcon size={20} color="#93959f" /></span>
                 <input
                     type="text"
                     placeholder="Search..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 {searchQuery && (
                     <button className="clear-search" onClick={() => setSearchQuery("")}>
                     <CloseIcon size={12} color="#666" />
                     </button>
                 )}
                 </div>
             </div>

             {/* Content Area (Sidebar + Grid) */}
             <div className="food-layout" style={{ display: 'flex', gap: '15px', flex: 1, overflow: 'hidden' }}>
                 {/* Vertical Category Sidebar */}
                 <div className="food-sidebar-categories" style={{ 
                     width: '100px', 
                     display: 'flex', 
                     flexDirection: 'column', 
                     gap: '10px',
                     overflowY: 'auto',
                     flexShrink: 0
                 }}>
                     {computedCategories.map((cat) => {
                         const IconComponent = cat.Icon;
                         const isActive = activeCategory === cat.key;
                         return (
                         <button
                             key={cat.key}
                             onClick={() => setActiveCategory(cat.key)}
                             style={{
                                 padding: '10px 5px',
                                 borderRadius: '12px',
                                 background: isActive ? '#F08626' : '#fff',
                                 border: isActive ? 'none' : '1px solid #f0f0f0',
                                 color: isActive ? '#fff' : '#4b5563',
                                 display: 'flex',
                                 flexDirection: 'column', 
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '6px',
                                 cursor: 'pointer',
                                 transition: 'all 0.2s',
                                 width: '100%',
                                 minHeight: '80px',
                                 boxShadow: isActive ? '0 3px 8px rgba(240, 134, 38, 0.3)' : '0 2px 5px rgba(0,0,0,0.03)',
                             }}
                         >
                             <span style={{ 
                                 display: 'flex', 
                                 alignItems: 'center', 
                                 justifyContent: 'center',
                                 width: '36px',
                                 height: '36px',
                                 borderRadius: '50%',
                                 background: isActive ? 'rgba(255,255,255,0.2)' : '#FFF3E0',
                                 color: isActive ? '#fff' : '#F08626',
                                 marginBottom: '2px'
                             }}>
                             <IconComponent size={18} />
                             </span>
                             <span style={{ 
                                 fontSize: '11px',
                                 fontWeight: isActive ? '700' : '600',
                                 textAlign: 'center',
                                 lineHeight: '1.2'
                             }}>{cat.label}</span>
                         </button>
                         );
                     })}
                 </div>

                 {/* FOOD GRID */}
                 <div className="food-grid" style={{ overflowY: 'auto', padding: '5px', flex: 1, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                     {loading ? (
                     <div className="loading-state">
                         <p>Loading...</p>
                     </div>
                     ) : filteredItems.length === 0 ? (
                     <div className="empty-state">
                         <p>No items found</p>
                     </div>
                     ) : (
                         filteredItems.map((item) => {
                             const qty = getItemQty(item.id);
                             return (
                                 <div className="food-item-card" key={item.id} style={{ padding: '10px' }}>
                                 <div className="food-item-image" style={{ height: '100px', marginBottom: '8px' }}>
                                     {item.imageUrl ? (
                                     <img 
                                         src={item.imageUrl} 
                                         alt={item.name} 
                                         style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: '8px' }}
                                         onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                                     />
                                     ) : null}
                                     <div className="food-placeholder-img" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
                                     <PlateIcon size={30} color="#ccc" />
                                     </div>
                                 </div>

                                 <div className="food-item-details">
                                     <h6 className="food-item-name" style={{ fontSize: '14px', marginBottom: '4px' }}>{item.name}</h6>
                                     <div className="food-item-footer">
                                     <span className="food-item-price" style={{ fontSize: '14px' }}>₹{item.price}</span>

                                     {qty === 0 ? (
                                         <button 
                                         className="add-to-cart-btn" 
                                         onClick={() => addItem(item)}
                                         style={{ padding: '6px 12px', fontSize: '12px' }}
                                         >
                                         ADD
                                         </button>
                                     ) : (
                                         <div className="qty-controls" style={{ transform: 'scale(0.9)' }}>
                                         <button onClick={() => updateQty(item.id, "dec")}><MinusIcon size={14} color="#F08626" /></button>
                                         <span style={{ fontSize: '14px' }}>{qty}</span>
                                         <button onClick={() => updateQty(item.id, "inc")}><PlusIcon size={14} color="#F08626" /></button>
                                         </div>
                                     )}
                                     </div>
                                 </div>
                                 </div>
                             );
                         })
                     )}
                 </div>
             </div>
         </div>

         {/* RIGHT SIDE: CART */}
         <div className="order-cart" style={{ width: '280px', flexShrink: 0, borderLeft: '1px solid #eee', paddingLeft: '15px', display: 'flex', flexDirection: 'column' }}>
           <h6 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <CartIcon size={18} /> Current Order
           </h6>

           <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px' }}>
             {cart.length === 0 ? (
               <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '50px' }}>Cart is empty</p>
             ) : (
               cart.map((item) => (
                 <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                   <div>
                     <div style={{ fontWeight: '600' }}>{item.name}</div>
                     <div style={{ color: '#666' }}>₹{item.price} x {item.qty}</div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button onClick={() => updateQty(item.id, "dec")} style={{ border: 'none', background: '#eee', borderRadius: '4px', width: '20px', cursor: 'pointer' }}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, "inc")} style={{ border: 'none', background: '#eee', borderRadius: '4px', width: '20px', cursor: 'pointer' }}>+</button>
                   </div>
                 </div>
               ))
             )}
           </div>

           <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 'bold' }}>
               <span>Total</span>
               <span>₹{total.toFixed(2)}</span>
             </div>
             
             <div style={{ display: 'flex', gap: '10px' }}>
               <button 
                 onClick={onCancel}
                 style={{ flex: 1, padding: '10px', border: '1px solid #ddd', background: '#fff', borderRadius: '8px', cursor: 'pointer' }}
               >
                 Cancel
               </button>
               <button 
                 onClick={() => cart.length > 0 && onSubmit(cart)}
                 disabled={cart.length === 0}
                 style={{ 
                   flex: 2, 
                   padding: '10px', 
                   background: cart.length > 0 ? '#F08626' : '#ccc', 
                   color: '#fff', 
                   border: 'none', 
                   borderRadius: '8px', 
                   cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                   fontWeight: 'bold'
                 }}
               >
                 Add to Queue
               </button>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
};

export default FoodMenuSelection;
