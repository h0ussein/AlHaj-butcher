import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const CustomOrderModal = ({ onClose }) => {
  const [customMessage, setCustomMessage] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { t, language } = useLanguage();
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        orderType: 'custom',
        customMessage,
        deliveryInfo
      };

      const response = await fetch(buildApiUrl(API_ENDPOINTS.ORDERS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم إرسال الطلب المخصص بنجاح!' : 'Custom order placed successfully!');
        onClose();
      } else {
        toast.error(data.message || (language === 'ar' ? 'حدث خطأ في إرسال الطلب' : 'Error placing order'));
      }
    } catch (error) {
      console.error('Custom order error:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {t('customOrder')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Custom Message */}
            <div>
              <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' 
                  ? 'اكتب وصفاً مفصلاً لما تريد طلبه' 
                  : 'Describe in detail what you would like to order'
                }
              </label>
              <textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' 
                  ? 'مثال: أريد 2 كيلو لحم بقري مقطع شرائح، 1 كيلو دجاج كامل، و 500 جرام لحم مفروم...'
                  : 'Example: I want 2kg beef cut into slices, 1 whole chicken, and 500g ground meat...'
                }
              />
            </div>

            {/* Delivery Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                {language === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
              </h3>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'العنوان' : 'Address'}
                </label>
                <input
                  type="text"
                  id="address"
                  value={deliveryInfo.address}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={language === 'ar' ? 'أدخل عنوانك الكامل' : 'Enter your full address'}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'رقم الهاتف للتواصل' : 'Contact Phone Number'}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={deliveryInfo.phone}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                />
              </div>

              {/* Removed preferred time as requested */}
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                {language === 'ar' 
                  ? 'سيتم التواصل معك لتأكيد الطلب وتحديد السعر النهائي'
                  : 'We will contact you to confirm the order and determine the final price'
                }
              </p>
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
                disabled={loading || !customMessage.trim()}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('loading') : t('placeOrder')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomOrderModal;
