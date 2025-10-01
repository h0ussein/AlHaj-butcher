import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import AdminOrders from '../components/AdminOrders';
import AdminProducts from '../components/AdminProducts';
import AdminCategories from '../components/AdminCategories';
import AdminSettings from '../components/AdminSettings';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const { setIsOnOrdersPage } = useNotification();

  // Notify notification context when admin is on orders page
  useEffect(() => {
    if (activeTab === 'orders') {
      setIsOnOrdersPage(true);
    } else {
      setIsOnOrdersPage(false);
    }
  }, [activeTab, setIsOnOrdersPage]);

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {language === 'ar' ? 'غير مصرح لك بالوصول' : 'Access Denied'}
        </h1>
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'تحتاج صلاحيات إدارية للوصول إلى هذه الصفحة'
            : 'You need admin privileges to access this page'
          }
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'orders', label: language === 'ar' ? 'الطلبات' : 'Orders' },
    { id: 'products', label: language === 'ar' ? 'المنتجات' : 'Products' },
    { id: 'categories', label: language === 'ar' ? 'الفئات' : 'Categories' },
    { id: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Settings' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {language === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
        </h1>
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'إدارة الطلبات والمنتجات والفئات'
            : 'Manage orders, products, and categories'
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
};

export default Admin;
