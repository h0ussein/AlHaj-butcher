import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const { t, language } = useLanguage();

  const getCategoryName = (category) => {
    return language === 'ar' ? category.nameAr : category.name;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('categories')}
      </h3>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === ''
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {language === 'ar' ? 'الكل' : 'All'}
        </button>
        
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryChange(category._id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category._id
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
