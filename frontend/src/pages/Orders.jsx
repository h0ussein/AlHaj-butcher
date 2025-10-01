import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import OrderCard from '../components/OrderCard';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { t, language } = useLanguage();
  const { token } = useAuth();

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
  }, [language]);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch('http://localhost:5001/api/orders/my-orders', {
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
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1"></div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('myOrders')}
          </h1>
          <div className="flex-1 flex justify-end">
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
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'تتبع جميع طلباتك هنا'
            : 'Track all your orders here'
          }
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {language === 'ar' ? 'لا توجد طلبات' : 'No Orders Yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === 'ar' 
              ? 'ابدأ بطلب منتجاتنا الطازجة'
              : 'Start by ordering our fresh products'
            }
          </p>
          <a
            href="/products"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
