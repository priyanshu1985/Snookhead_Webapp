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

const categories = [
  { id: 'All', label: 'All', icon: <FoodIcon size={24} /> }, // Using generic FoodIcon for All
  { id: 'Food', label: 'Food', icon: <PreparedFoodIcon size={24} /> },
  { id: 'Fast Food', label: 'Fast Food', icon: <FastFoodIcon size={24} /> },
  { id: 'Snacks', label: 'Snacks', icon: <SnacksIcon size={24} /> },
  { id: 'Beverages', label: 'Beverages', icon: <BeveragesIcon size={24} /> },
  { id: 'Desserts', label: 'Desserts', icon: <DessertsIcon size={24} /> },
  { id: 'Prepared', label: 'Prepared', icon: <PreparedFoodIcon size={24} /> },
  { id: 'Packed', label: 'Packed', icon: <PackedFoodIcon size={24} /> },
  { id: 'Cigarette', label: 'Cigarette', icon: <CigaretteIcon size={24} /> },
];

const FoodCategoryTabs = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="food-category-tabs-container">
      <div className="food-category-tabs">
        {categories.map((cat) => {
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
