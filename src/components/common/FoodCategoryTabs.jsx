import React from 'react';
import '../../styles/foodCategoryTabs.css';

const categories = [
  { id: 'All', label: 'All', icon: '🍽️' },
  { id: 'Food', label: 'Food', icon: '🍛' },
  { id: 'Fast Food', label: 'Fast Food', icon: '🍔' },
  { id: 'Snacks', label: 'Snacks', icon: '🍿' },
  { id: 'Beverages', label: 'Beverages', icon: '🥤' },
  { id: 'Desserts', label: 'Desserts', icon: '🍰' },
  { id: 'Prepared', label: 'Prepared', icon: '🍴' },
  { id: 'Packed', label: 'Packed', icon: '📦' },
  { id: 'Cigarette', label: 'Cigarette', icon: '🚬' },
];

const FoodCategoryTabs = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="food-category-tabs-container">
      <div className="food-category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`food-category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <span className="tab-icon">{cat.icon}</span>
            <span className="tab-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FoodCategoryTabs;
