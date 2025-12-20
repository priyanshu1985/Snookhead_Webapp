const categories = ["Prepared food", "Packed foods", "Cigarette", "Beverage"];

const MenuItems = () => {
  return (
    <div className="menu-tab">
      <div className="menu-categories">
        {categories.map((cat, i) => (
          <span key={i} className={i === 0 ? "active" : ""}>
            {cat}
          </span>
        ))}
      </div>

      <div className="menu-list">
        {[...Array(10)].map((_, i) => (
          <div className="menu-item" key={i}>
            <div className="img"></div>
            <div className="info">
              <h6>Paneer wrap</h6>
              <p>Soft roti filled with spiced paneer</p>
              <span>₹75</span>
            </div>
          </div>
        ))}
      </div>

      <button className="add-btn center">+ Add New Game</button>
    </div>
  );
};

export default MenuItems;
