import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const Cart = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ totalUSD: 0, totalLBP: 0 });
  const [deliveryApplied, setDeliveryApplied] = useState(false);
  const { language } = useLanguage();
  const { token } = useAuth();
  const { cart, removeFromCart, clearCart, getTotalAmount } = useCart();

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const getProductName = (product) => {
    return language === 'ar' ? product.nameAr : product.name;
  };

  // Update totals when cart changes
  useEffect(() => {
    const updateTotals = async () => {
      const newTotals = await getTotalAmount(deliveryApplied);
      setTotals(newTotals);
    };
    updateTotals();
  }, [cart.items, deliveryApplied, getTotalAmount]);

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error(language === 'ar' ? 'السلة فارغة' : 'Cart is empty');
      return;
    }

    console.log('Cart items before checkout:', cart.items);
    setLoading(true);
    try {
      const orderData = {
        orderType: 'product',
        deliveryApplied,
        items: cart.items.map(item => {
          const orderItem = {
            product: item.product._id
          };
          
          // Add meat type if selected
          if (item.selectedMeatType) {
            orderItem.meatType = item.selectedMeatType;
          }
          
          if (item.orderType === 'quantity') {
            orderItem.quantity = parseFloat(item.quantity);
          } else if (item.orderType === 'amount') {
            if (item.amountType === 'USD' && item.amountUSD > 0) {
              orderItem.amountUSD = Math.round(parseFloat(item.amountUSD));
            }
            if (item.amountType === 'LBP' && item.amountLBP > 0) {
              orderItem.amountLBP = parseFloat(item.amountLBP);
            }
          }
          
          return orderItem;
        })
      };

      console.log('Sending order data:', orderData);
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ORDERS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم إرسال الطلب بنجاح!' : 'Order placed successfully!');
        clearCart();
        onClose();
      } else {
        console.error('Order error response:', data);
        toast.error(data.message || (language === 'ar' ? 'حدث خطأ في إرسال الطلب' : 'Error placing order'));
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Cart Items */}
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg">
                {language === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {getProductName(item.product)}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">{language === 'ar' ? 'النوع' : 'Type'}:</span>
                          <span className="ml-2">
                            {item.orderType === 'amount' 
                              ? (language === 'ar' ? 'بالمبلغ' : 'By Amount')
                              : (language === 'ar' ? 'بالكمية' : 'By Quantity')
                            }
                          </span>
                        </div>
                        {item.orderType === 'amount' && (
                          <div>
                            <span className="font-medium">{language === 'ar' ? 'المبلغ' : 'Amount'}:</span>
                            <span className="ml-2">
                              {item.amountType === 'USD' 
                                ? `$${item.amountUSD} USD`
                                : `${formatNumber(item.amountLBP)} LBP`
                              }
                            </span>
                          </div>
                        )}
                        {item.orderType === 'quantity' && (
                          <div>
                            <span className="font-medium">{language === 'ar' ? 'الكمية' : 'Quantity'}:</span>
                            <span className="ml-2">{item.quantity} kg</span>
                          </div>
                        )}
                        {item.selectedMeatType && item.product.meatTypes && (
                          <div>
                            <span className="font-medium">{language === 'ar' ? 'نوع اللحم' : 'Meat Type'}:</span>
                            <span className="ml-2 text-blue-600">
                              {language === 'ar' 
                                ? item.product.meatTypes.find(mt => mt._id === item.selectedMeatType)?.nameAr
                                : item.product.meatTypes.find(mt => mt._id === item.selectedMeatType)?.name
                              }
                            </span>
                          </div>
                        )}
                        {(item.amountUSD > 0 || item.amountLBP > 0) && (
                          <div>
                            <span className="font-medium">{language === 'ar' ? 'السعر' : 'Price'}:</span>
                            <span className="ml-2">
                              {item.amountUSD > 0 && `$${item.amountUSD} USD`}
                              {item.amountUSD > 0 && item.amountLBP > 0 && ' / '}
                              {item.amountLBP > 0 && `${formatNumber(item.amountLBP)} LBP`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      {language === 'ar' ? 'حذف' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}

              {/* Delivery Option */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryApplied}
                    onChange={(e) => setDeliveryApplied(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {language === 'ar' ? 'خدمة التوصيل' : 'Delivery Service'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'ar' ? 'يضاف 100,000 ل.ل على المجموع عند تفعيل التوصيل.' : 'Adds 100,000 LBP to total when enabled.'}
                    </div>
                  </div>
                </label>
                {deliveryApplied && (
                  <div className="mt-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
                    {language === 'ar' ? 'سيتم التواصل معك لتأكيد تفاصيل التوصيل.' : 'We will contact you to confirm delivery details.'}
                  </div>
                )}
              </div>

              {/* Total */}
              {(totals.totalUSD > 0 || totals.totalLBP > 0) && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>{language === 'ar' ? 'المجموع' : 'Total'}:</span>
                    <div className="text-right">
                      {totals.totalUSD > 0 && (
                        <div className="text-green-600">${totals.totalUSD} USD</div>
                      )}
                      {totals.totalLBP > 0 && (
                        <div className="text-blue-600">{formatNumber(totals.totalLBP)} LBP</div>
                      )}
                    </div>
                  </div>
                  {deliveryApplied && (
                    <div className="text-sm text-gray-600 mt-2">
                      + 100,000 LBP {language === 'ar' ? 'رسوم التوصيل' : 'delivery fee'}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-6">
                <button
                  onClick={clearCart}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  {language === 'ar' ? 'مسح السلة' : 'Clear Cart'}
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading 
                    ? (language === 'ar' ? 'جاري الإرسال...' : 'Processing...')
                    : (language === 'ar' ? 'تأكيد الطلب' : 'Checkout')
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
