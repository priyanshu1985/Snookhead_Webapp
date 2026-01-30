import React from 'react';
import '../../styles/foodCategoryTabs.css';

import {
  PreparedFoodIcon,
  PackedFoodIcon,
  BeveragesIcon,
  FastFoodIcon,
  SnacksIcon,
  DessertsIcon,
  CigaretteIcon,
  FoodIcon
} from './Icons';

export const DEFAULT_CATEGORIES = [
  { id: 'All', label: 'All', icon: <FoodIcon size={24} /> },
  { id: 'prepared', label: 'Prepared Food', icon: <PreparedFoodIcon size={24} /> },
  { id: 'packed', label: 'Packed Food', icon: <PackedFoodIcon size={24} /> },
];

const FoodCategoryTabs = ({ selectedCategory, onSelectCategory, categories }) => {
  const displayCategories = categories || DEFAULT_CATEGORIES;

  return (
    <div className="food-category-tabs-container">
      <div className="food-category-tabs">
        {displayCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`food-category-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="tab-icon">
                {React.cloneElement(cat.icon, { 
                  color: isActive ? "#FFFFFF" : "#F08626" 
                })}
              </span>
              <span className="tab-label">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FoodCategoryTabs;
