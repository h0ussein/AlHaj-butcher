import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, confirmed, ready, out_for_delivery
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [orderToReject, setOrderToReject] = useState(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const { fetchPendingOrdersCount } = useNotification();

  useEffect(() => {
    fetchOrders();
    
    // Set up interval for toast reminders
    const intervalId = setInterval(() => {
      toast.info(
        language === 'ar' ? 'تذكير: قم بالتحديث لرؤية آخر تحديثات الطلبات' : 'Reminder: refresh to see latest order updates', 
        { duration: 10000 }
      );
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [activeTab, language]);

  // Show toast when new orders arrive
  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0 && activeTab === 'pending') {
      const newOrderCount = orders.length - lastOrderCount;
      toast.success(
        language === 'ar' ? `لديك ${newOrderCount} طلب جديد في الانتظار` : `You have ${newOrderCount} new pending order(s)`,
        { duration: 5000 }
      );
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount, activeTab, language]);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const url = buildApiUrl(API_ENDPOINTS.ORDERS_BY_STATUS(activeTab));
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const updateOrderStatus = async (orderId, newStatus, notes = '') => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ORDER_STATUS(orderId)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, notes })
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated');
        fetchOrders(); // Refresh orders
        fetchPendingOrdersCount(); // Update notification count
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في تحديث الطلب' : 'Error updating order'));
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    }
  };

  const toggleDeliveryAssigned = async (orderId, isAssigned) => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ORDER_STATUS(orderId)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: activeTab, notes: '', isDeliveryAssigned: isAssigned })
      });
      if (response.ok) {
        toast.success(language === 'ar' ? 'تم تحديث حالة التوصيل' : 'Delivery status updated');
        fetchOrders();
        fetchPendingOrdersCount(); // Update notification count
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openRejectModal = (orderId) => {
    setOrderToReject(orderId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setOrderToReject(null);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال سبب الرفض' : 'Please enter a rejection reason');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ORDER_STATUS(orderToReject)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'rejected', 
          rejectionReason: rejectReason.trim() 
        })
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم رفض الطلب' : 'Order rejected');
        closeRejectModal();
        fetchOrders();
        fetchPendingOrdersCount(); // Update notification count
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في رفض الطلب' : 'Error rejecting order'));
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    }
  };

  const openDeleteModal = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ORDER_BY_ID(orderToDelete)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم حذف الطلب' : 'Order deleted successfully');
        closeDeleteModal();
        fetchOrders();
        fetchPendingOrdersCount(); // Update notification count
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في حذف الطلب' : 'Error deleting order'));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: language === 'ar' ? 'في الانتظار' : 'Pending',
      confirmed: language === 'ar' ? 'مؤكد' : 'Confirmed',
      ready: language === 'ar' ? 'جاهز' : 'Ready',
      out_for_delivery: language === 'ar' ? 'خارج للتوصيل' : 'Out for delivery',
      completed: language === 'ar' ? 'مكتمل' : 'Completed',
      rejected: language === 'ar' ? 'مرفوض' : 'Rejected'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-LB' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Tabs and Refresh */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-yellow-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'ar' ? 'في الانتظار' : 'Pending Orders'}
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'confirmed'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'ar' ? 'مؤكد' : 'Confirmed'}
            </button>
            <button
              onClick={() => setActiveTab('ready')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'ready'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'ar' ? 'جاهز' : 'Ready'}
            </button>
            <button
              onClick={() => setActiveTab('out_for_delivery')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'out_for_delivery'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'ar' ? 'خارج للتوصيل' : 'Out for delivery'}
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'rejected'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'ar' ? 'مرفوض' : 'Rejected'}
            </button>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <span>{refreshing ? '⟳' : '↻'}</span>
            <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'طلب رقم' : 'Order #'}{order._id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.customer?.firstName} {order.customer?.lastName} - {order.customer?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Order Details */}
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">{language === 'ar' ? 'النوع' : 'Type'}:</span>
                        <span className="ml-2">
                          {order.orderType === 'custom' 
                            ? (language === 'ar' ? 'طلب مخصص' : 'Custom Order')
                            : (language === 'ar' ? 'طلب منتج' : 'Product Order')
                          }
                        </span>
                      </div>
                      {(order.totalAmountUSD > 0 || order.totalAmountLBP > 0) && (
                        <div>
                          <span className="font-medium">{language === 'ar' ? 'المجموع' : 'Total'}:</span>
                          <span className="ml-2">
                            {order.totalAmountUSD > 0 && `$${order.totalAmountUSD} USD`}
                            {order.totalAmountUSD > 0 && order.totalAmountLBP > 0 && ' / '}
                            {order.totalAmountLBP > 0 && `${order.totalAmountLBP.toLocaleString()} LBP`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      {language === 'ar' ? 'معلومات العميل' : 'Customer Info'}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">{language === 'ar' ? 'الهاتف' : 'Phone'}:</span>
                        <span className="ml-2">{order.customer?.mobile}</span>
                      </div>
                      {order.deliveryInfo?.address && (
                        <div>
                          <span className="font-medium">{language === 'ar' ? 'العنوان' : 'Address'}:</span>
                          <span className="ml-2">{order.deliveryInfo.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {order.orderType === 'product' && order.items && order.items.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    {language === 'ar' ? 'المنتجات المطلوبة' : 'Ordered Products'}
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {item.product?.name || (language === 'ar' ? 'منتج غير محدد' : 'Unknown Product')}
                            </div>
                            {item.meatType && (
                              <div className="text-sm text-blue-600 mt-1">
                                {language === 'ar' ? 'نوع اللحم:' : 'Meat Type:'} {language === 'ar' ? item.meatType.nameAr : item.meatType.name}
                              </div>
                            )}
                            {item.quantity && (
                              <div className="text-gray-500 mt-1">
                                {language === 'ar' ? 'الكمية:' : 'Quantity:'} {item.quantity} kg
                              </div>
                            )}
                            {item.customDescription && (
                              <div className="text-gray-600 mt-1 italic">
                                {item.customDescription}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {item.amountUSD > 0 && (
                              <div className="font-medium text-green-600">${item.amountUSD} USD</div>
                            )}
                            {item.amountLBP > 0 && (
                              <div className="text-gray-600">{item.amountLBP.toLocaleString()} LBP</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Message */}
              {order.customMessage && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    {language === 'ar' ? 'رسالة مخصصة' : 'Custom Message'}
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {order.customMessage}
                  </p>
                </div>
              )}

              {/* Status Update */}
              {order.status === 'pending' && (
                <div className="flex items-center space-x-4 pt-4 border-t">
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'تحديث الحالة' : 'Update Status'}:
                  </span>
                  <button
                    onClick={() => updateOrderStatus(order._id, 'confirmed')}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {language === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'}
                  </button>
                  <button
                    onClick={() => openRejectModal(order._id)}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    {language === 'ar' ? 'رفض الطلب' : 'Reject Order'}
                  </button>
                </div>
              )}
              
              {order.status === 'confirmed' && (
                <div className="flex items-center space-x-4 pt-4 border-t">
                  <span className="text-sm font-medium text-green-600">
                    {language === 'ar' ? 'تم تأكيد الطلب' : 'Order Confirmed'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {language === 'ar' ? 'تم نقل الطلب إلى التاريخ' : 'Order moved to history'}
                  </span>
                  <label className="flex items-center space-x-2 ml-auto">
                    <input
                      type="checkbox"
                      checked={order.isDeliveryAssigned}
                      onChange={(e) => toggleDeliveryAssigned(order._id, e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">
                      {language === 'ar' ? 'تم تسليم الطلب إلى عامل التوصيل' : 'Assigned to delivery man'}
                    </span>
                  </label>
                  <button
                    onClick={() => updateOrderStatus(order._id, 'ready')}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {language === 'ar' ? 'جاهز' : 'Mark Ready'}
                  </button>
                </div>
              )}

              {order.status === 'ready' && (
                <div className="flex items-center space-x-4 pt-4 border-t">
                  <span className="text-sm font-medium text-blue-600">
                    {language === 'ar' ? 'جاهز للتسليم' : 'Ready for pickup'}
                  </span>
                  {order.deliveryApplied ? (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'out_for_delivery')}
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      {language === 'ar' ? 'خارج للتوصيل' : 'Out for delivery'}
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'completed')}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      {language === 'ar' ? 'إكمال' : 'Complete'}
                    </button>
                  )}
                </div>
              )}

              {order.status === 'out_for_delivery' && (
                <div className="flex items-center space-x-4 pt-4 border-t">
                  <span className="text-sm font-medium text-purple-600">
                    {language === 'ar' ? 'خارج للتوصيل' : 'Out for delivery'}
                  </span>
                  <button
                    onClick={() => updateOrderStatus(order._id, 'completed')}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {language === 'ar' ? 'تم التسليم' : 'Delivered'}
                  </button>
                </div>
              )}

              {/* Rejection Reason */}
              {order.status === 'rejected' && order.rejectionReason && (
                <div className="pt-4 border-t">
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
                    <div className="font-semibold mb-1">{language === 'ar' ? 'سبب الرفض' : 'Rejection Reason'}</div>
                    <div>{order.rejectionReason}</div>
                  </div>
                </div>
              )}

              {/* Delete Button for Rejected Orders */}
              {order.status === 'rejected' && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => openDeleteModal(order._id)}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    {language === 'ar' ? 'حذف الطلب' : 'Delete Order'}
                  </button>
                </div>
              )}

              {/* Notifications Status */}
              <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t">
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
                <button
                  onClick={() => fetchOrders()}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {language === 'ar' ? 'تحديث' : 'Refresh'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'رفض الطلب' : 'Reject Order'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {language === 'ar' ? 'يرجى إدخال سبب رفض الطلب' : 'Please enter the reason for rejecting this order'}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={language === 'ar' ? 'سبب الرفض...' : 'Rejection reason...'}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={submitReject}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {language === 'ar' ? 'رفض الطلب' : 'Reject Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {language === 'ar' 
                ? 'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.' 
                : 'Are you sure you want to delete this order? This action cannot be undone.'
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
