import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const OrderCard = ({ order }) => {
  const { t, language } = useLanguage();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: language === 'ar' ? 'في الانتظار' : 'Pending',
      confirmed: language === 'ar' ? 'مؤكد' : 'Confirmed',
      ready: language === 'ar' ? 'جاهز' : 'Ready',
      completed: language === 'ar' ? 'مكتمل' : 'Completed'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-LB' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProductName = (product) => {
    if (!product) return language === 'ar' ? 'منتج محذوف' : 'Deleted Product';
    return language === 'ar' ? product.nameAr : product.name;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'ar' ? 'طلب رقم' : 'Order #'}{order._id.slice(-8)}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Order Type */}
      <div className="mb-4">
        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
          {order.orderType === 'custom' 
            ? (language === 'ar' ? 'طلب مخصص' : 'Custom Order')
            : (language === 'ar' ? 'طلب منتج' : 'Product Order')
          }
        </span>
      </div>

      {/* Order Items */}
      {order.orderType === 'product' && order.items && order.items.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  {getProductName(item.product)}
                  {item.quantity && (
                    <span className="text-gray-500 ml-2">
                      ({item.quantity} {item.product?.unit || 'kg'})
                    </span>
                  )}
                </span>
                <div className="text-right">
                  {item.amountUSD > 0 && (
                    <div className="font-medium">${item.amountUSD} USD</div>
                  )}
                  {item.amountLBP > 0 && (
                    <div className="text-gray-500">{item.amountLBP.toLocaleString()} LBP</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Message */}
      {order.orderType === 'custom' && order.customMessage && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {language === 'ar' ? 'وصف الطلب' : 'Order Description'}
          </h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
            {order.customMessage}
          </p>
        </div>
      )}

      {/* Delivery Info */}
      {order.deliveryInfo && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {language === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            {order.deliveryInfo.address && (
              <div>
                <span className="font-medium">{language === 'ar' ? 'العنوان' : 'Address'}:</span>
                <span className="ml-2">{order.deliveryInfo.address}</span>
              </div>
            )}
            {order.deliveryInfo.phone && (
              <div>
                <span className="font-medium">{language === 'ar' ? 'الهاتف' : 'Phone'}:</span>
                <span className="ml-2">{order.deliveryInfo.phone}</span>
              </div>
            )}
            {order.deliveryInfo.preferredTime && (
              <div>
                <span className="font-medium">{language === 'ar' ? 'الوقت المفضل' : 'Preferred Time'}:</span>
                <span className="ml-2">{order.deliveryInfo.preferredTime}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Total */}
      {(order.totalAmountUSD > 0 || order.totalAmountLBP > 0) && (
        <div className="mb-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900">
              {t('orderTotal')}:
            </span>
            <div className="text-right">
              {order.totalAmountUSD > 0 && (
                <div className="font-semibold text-lg">${order.totalAmountUSD} USD</div>
              )}
              {order.totalAmountLBP > 0 && (
                <div className="text-sm text-gray-600">{order.totalAmountLBP.toLocaleString()} LBP</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {language === 'ar' ? 'ملاحظات' : 'Notes'}
          </h4>
          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md">
            {order.notes}
          </p>
        </div>
      )}

      {/* Notifications Status */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
        <div className="flex space-x-4">
          {order.isEmailSent && (
            <span className="flex items-center">
              📧 {language === 'ar' ? 'تم إرسال الإيميل' : 'Email sent'}
            </span>
          )}
          {order.isWhatsAppSent && (
            <span className="flex items-center">
              📱 {language === 'ar' ? 'تم إرسال الواتساب' : 'WhatsApp sent'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
