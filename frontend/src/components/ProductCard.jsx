import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import OrderModal from './OrderModal';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedMeatType, setSelectedMeatType] = useState(null);
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const handleOrderClick = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      window.location.href = '/login';
      return;
    }
    
    // Check if product has meat types and one is selected
    if (product.meatTypes && product.meatTypes.length > 0 && !selectedMeatType) {
      toast.error(language === 'ar' ? 'يرجى اختيار نوع اللحم' : 'Please select a meat type');
      return;
    }
    
    setShowOrderModal(true);
  };

  const getProductName = () => {
    return language === 'ar' ? product.nameAr : product.name;
  };

  const getProductDescription = () => {
    return language === 'ar' ? product.descriptionAr : product.description;
  };

  const getCategoryName = () => {
    if (!product.category) return '';
    return language === 'ar' ? product.category.nameAr : product.category.name;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Product Image */}
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={getProductName()}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-4xl text-gray-400">🥩</div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {getProductName()}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              product.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.isAvailable ? t('available') : t('notAvailable')}
            </span>
          </div>

          {getCategoryName() && (
            <p className="text-sm text-gray-500 mb-2">
              {getCategoryName()}
            </p>
          )}

          {getProductDescription() && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {getProductDescription()}
            </p>
          )}

          {/* Price */}
          <div className="mb-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{t('price')}:</span>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ${product.priceUSD} USD
                </div>
                <div className="text-sm text-gray-600">
                  {product.priceLBP.toLocaleString()} LBP
                </div>
              </div>
            </div>
          </div>

          {/* Meat Type Selection */}
          {product.meatTypes && product.meatTypes.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">
                {language === 'ar' ? 'اختر نوع اللحم:' : 'Choose Meat Type:'}
              </div>
              <div className="space-y-2">
                {product.meatTypes.map((meatType) => (
                  <label key={meatType._id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`meatType-${product._id}`}
                      value={meatType._id}
                      checked={selectedMeatType === meatType._id}
                      onChange={(e) => setSelectedMeatType(e.target.value)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {language === 'ar' ? meatType.nameAr : meatType.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          ${meatType.priceUSD} USD
                        </span>
                      </div>
                      {meatType.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'ar' ? meatType.descriptionAr : meatType.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Order Button */}
          <button
            onClick={handleOrderClick}
            disabled={!product.isAvailable}
            className={`w-full mt-auto py-2 px-4 rounded-md font-medium transition-colors ${
              product.isAvailable
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.isAvailable ? t('addToOrder') : t('notAvailable')}
          </button>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal
          product={product}
          selectedMeatType={selectedMeatType}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
