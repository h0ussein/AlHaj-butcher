import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import CustomOrderModal from '../components/CustomOrderModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCustomOrder, setShowCustomOrder] = useState(false);
  
  const { t, language } = useLanguage();
  const { token } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const url = selectedCategory 
        ? `http://localhost:5001/api/products?category=${selectedCategory}`
        : 'http://localhost:5001/api/products';
      
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('products')}
        </h1>
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'اختر من منتجاتنا الطازجة أو اطلب طلباً مخصصاً'
            : 'Choose from our fresh products or place a custom order'
          }
        </p>
      </div>

      {/* Custom Order Button */}
      <div className="text-center">
        <button
          onClick={() => setShowCustomOrder(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          {t('customOrder')}
        </button>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {language === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Custom Order Modal */}
      {showCustomOrder && (
        <CustomOrderModal
          onClose={() => setShowCustomOrder(false)}
        />
      )}
    </div>
  );
};

export default Products;
