import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const OrderModal = ({ product, selectedMeatType, onClose }) => {
  const [orderType, setOrderType] = useState('amount'); // 'amount' or 'quantity'
  const [amountType, setAmountType] = useState('USD'); // 'USD' or 'LBP'
  const [amountUSD, setAmountUSD] = useState('');
  const [amountLBP, setAmountLBP] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const { addToCart } = useCart();

  // Fetch settings on component mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.SETTINGS));
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const getProductName = () => {
    return language === 'ar' ? product.nameAr : product.name;
  };

  const getSelectedMeatType = () => {
    if (!selectedMeatType || !product.meatTypes) return null;
    return product.meatTypes.find(mt => mt._id === selectedMeatType);
  };

  const getCurrentPrice = () => {
    const meatType = getSelectedMeatType();
    if (meatType) {
      return {
        USD: meatType.priceUSD,
        LBP: meatType.priceLBP
      };
    }
    return {
      USD: product.priceUSD,
      LBP: product.priceLBP
    };
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (orderType === 'amount') {
      const amount = amountType === 'USD' ? amountUSD : amountLBP;
      if (!amount || amount <= 0) {
        toast.error(language === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount');
        return;
      }
    } else {
      if (!quantity || quantity <= 0) {
        toast.error(language === 'ar' ? 'يرجى إدخال كمية صحيحة' : 'Please enter a valid quantity');
        return;
      }
    }

    // Add to cart
    const amount = orderType === 'amount' ? (amountType === 'USD' ? amountUSD : amountLBP) : quantity;
    addToCart(product, orderType, amountType, amount, quantity, selectedMeatType);
    
    toast.success(language === 'ar' ? 'تم إضافة المنتج إلى السلة!' : 'Product added to cart!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'طلب' : 'Order'} - {getProductName()}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'نوع الطلب' : 'Order Type'}
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="amount"
                    checked={orderType === 'amount'}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="mr-2"
                  />
                  {language === 'ar' ? 'بالمبلغ' : 'By Amount'}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="quantity"
                    checked={orderType === 'quantity'}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="mr-2"
                  />
                  {language === 'ar' ? 'بالكمية' : 'By Quantity'}
                </label>
              </div>
            </div>

            {/* Amount Type Selection */}
            {orderType === 'amount' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'اختر العملة' : 'Choose Currency'}
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="USD"
                        checked={amountType === 'USD'}
                        onChange={(e) => {
                          setAmountType(e.target.value);
                          setAmountLBP(''); // Clear LBP when switching to USD
                        }}
                        className="mr-2"
                      />
                      USD
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="LBP"
                        checked={amountType === 'LBP'}
                        onChange={(e) => {
                          setAmountType(e.target.value);
                          setAmountUSD(''); // Clear USD when switching to LBP
                        }}
                        className="mr-2"
                      />
                      LBP
                    </label>
                  </div>
                </div>

                {/* Amount Input based on selected currency */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' 
                      ? `المبلغ بال${amountType === 'USD' ? 'دولار' : 'ليرة'}` 
                      : `Amount in ${amountType}`
                    }
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amountType === 'USD' ? amountUSD : amountLBP}
                    onChange={(e) => {
                      if (amountType === 'USD') {
                        setAmountUSD(e.target.value);
                      } else {
                        setAmountLBP(e.target.value);
                      }
                    }}
                    step={amountType === 'USD' ? '1' : '50000'}
                    min={amountType === 'LBP' && settings ? settings.minOrderAmountLBP : (amountType === 'USD' && settings ? settings.minOrderAmountUSD : '0')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={amountType === 'USD' ? '0' : '0'}
                  />
                  {amountType === 'LBP' && settings && (
                    <p className="text-sm text-gray-500 mt-1">
                      {language === 'ar' 
                        ? `الحد الأدنى للطلب: ${formatNumber(settings.minOrderAmountLBP)} ليرة لبنانية (زيادة بـ 50,000)`
                        : `Minimum order: ${formatNumber(settings.minOrderAmountLBP)} Lebanese Lira (increment by 50,000)`
                      }
                    </p>
                  )}
                  {amountType === 'USD' && settings && (
                    <p className="text-sm text-gray-500 mt-1">
                      {language === 'ar' 
                        ? `الحد الأدنى للطلب: $${settings.minOrderAmountUSD} دولار (زيادة بـ 1 دولار)`
                        : `Minimum order: $${settings.minOrderAmountUSD} USD (increment by 1 dollar)`
                      }
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quantity Input */}
            {orderType === 'quantity' && (
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'الكمية' : 'Quantity'} (kg)
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0.0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {language === 'ar' ? 'أدخل الكمية المطلوبة بالكيلوغرام' : 'Enter the required quantity in kilograms'}
                </p>
              </div>
            )}

            {/* Product Info */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                {language === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                {getSelectedMeatType() && (
                  <div>
                    <span className="font-medium">{language === 'ar' ? 'نوع اللحم المختار' : 'Selected Meat Type'}:</span>
                    <span className="ml-2">
                      {language === 'ar' ? getSelectedMeatType().nameAr : getSelectedMeatType().name}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium">{language === 'ar' ? 'السعر' : 'Price'}:</span>
                  <span className="ml-2">
                    ${getCurrentPrice().USD} USD / {formatNumber(getCurrentPrice().LBP)} LBP
                  </span>
                </div>
                {settings && (
                  <div>
                    <span className="font-medium">{language === 'ar' ? 'سعر الصرف' : 'Exchange Rate'}:</span>
                    <span className="ml-2">1$ = {formatNumber(settings.exchangeRate)} LBP</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                {t('cancel')}
              </button>
                  <button
                    type="submit"
                    disabled={loading || (orderType === 'amount' && !(amountType === 'USD' ? amountUSD : amountLBP)) || (orderType === 'quantity' && !quantity)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {language === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart'}
                  </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
