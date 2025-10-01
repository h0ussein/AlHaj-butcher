import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const MeatTypeManager = ({ product, onClose, onSuccess }) => {
  const [meatTypes, setMeatTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMeatType, setEditingMeatType] = useState(null);
  
  const { language } = useLanguage();
  const { token } = useAuth();

  useEffect(() => {
    fetchMeatTypes();
  }, [product._id]);

  const fetchMeatTypes = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MEAT_TYPES) + `/product/${product._id}`);
      const data = await response.json();
      setMeatTypes(data);
    } catch (error) {
      console.error('Error fetching meat types:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeatType = async (meatTypeId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف نوع اللحم هذا؟' : 'Are you sure you want to delete this meat type?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MEAT_TYPE_BY_ID(meatTypeId)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم حذف نوع اللحم بنجاح!' : 'Meat type deleted successfully!');
        fetchMeatTypes();
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في حذف نوع اللحم' : 'Error deleting meat type'));
      }
    } catch (error) {
      console.error('Error deleting meat type:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    }
  };

  const getProductName = () => {
    return language === 'ar' ? product.nameAr : product.name;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'إدارة أنواع اللحم' : 'Manage Meat Types'}
              </h2>
              <p className="text-gray-600 mt-1">
                {language === 'ar' ? 'المنتج:' : 'Product:'} {getProductName()}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>

          {/* Add Meat Type Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={meatTypes.length >= 3}
              className={`px-4 py-2 rounded-md transition-colors ${
                meatTypes.length >= 3
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {language === 'ar' ? 'إضافة نوع لحم' : 'Add Meat Type'}
              {meatTypes.length >= 3 && (
                <span className="ml-2 text-xs">
                  ({language === 'ar' ? 'الحد الأقصى 3' : 'Max 3'})
                </span>
              )}
            </button>
          </div>

          {/* Meat Types List */}
          <div className="space-y-4">
            {meatTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{language === 'ar' ? 'لا توجد أنواع لحم لهذا المنتج' : 'No meat types for this product'}</p>
                <p className="text-sm mt-2">
                  {language === 'ar' ? 'اضغط "إضافة نوع لحم" لبدء إضافة الأنواع' : 'Click "Add Meat Type" to start adding types'}
                </p>
              </div>
            ) : (
              meatTypes.map((meatType) => (
                <div key={meatType._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {language === 'ar' ? meatType.nameAr : meatType.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ${meatType.priceUSD} USD / {meatType.priceLBP.toLocaleString()} LBP
                        </span>
                      </div>
                      {meatType.description && (
                        <p className="text-gray-600 text-sm mb-2">
                          {language === 'ar' ? meatType.descriptionAr : meatType.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingMeatType(meatType)}
                        className="bg-blue-100 text-blue-800 px-3 py-1 text-xs rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {language === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                      <button
                        onClick={() => deleteMeatType(meatType._id)}
                        className="bg-red-100 text-red-800 px-3 py-1 text-xs rounded-full hover:bg-red-200 transition-colors"
                      >
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Meat Type Modal */}
      {showAddModal && (
        <AddMeatTypeModal
          product={product}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchMeatTypes();
          }}
        />
      )}

      {/* Edit Meat Type Modal */}
      {editingMeatType && (
        <EditMeatTypeModal
          meatType={editingMeatType}
          onClose={() => setEditingMeatType(null)}
          onSuccess={() => {
            setEditingMeatType(null);
            fetchMeatTypes();
          }}
        />
      )}
    </div>
  );
};

// Add Meat Type Modal
const AddMeatTypeModal = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    priceUSD: '',
    priceLBP: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { language } = useLanguage();
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MEAT_TYPES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          productId: product._id
        })
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم إضافة نوع اللحم بنجاح!' : 'Meat type added successfully!');
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في إضافة نوع اللحم' : 'Error adding meat type'));
      }
    } catch (error) {
      console.error('Error creating meat type:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'إضافة نوع لحم جديد' : 'Add New Meat Type'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'اسم نوع اللحم (إنجليزي)' : 'Meat Type Name (English)'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'مثال: لحم أحمر' : 'e.g., Red Meat'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'اسم نوع اللحم (عربي)' : 'Meat Type Name (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'مثال: لحم أحمر' : 'e.g., لحم أحمر'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'وصف نوع اللحم (إنجليزي)' : 'Meat Type Description (English)'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'وصف نوع اللحم باللغة الإنجليزية' : 'Describe the meat type in English'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'وصف نوع اللحم (عربي)' : 'Meat Type Description (Arabic)'}
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'وصف نوع اللحم باللغة العربية' : 'Describe the meat type in Arabic'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'السعر (دولار)' : 'Price (USD)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceUSD}
                  onChange={(e) => setFormData({...formData, priceUSD: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'السعر (ليرة)' : 'Price (LBP)'}
                </label>
                <input
                  type="number"
                  value={formData.priceLBP}
                  onChange={(e) => setFormData({...formData, priceLBP: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Meat Type Modal
const EditMeatTypeModal = ({ meatType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: meatType.name,
    nameAr: meatType.nameAr,
    description: meatType.description || '',
    descriptionAr: meatType.descriptionAr || '',
    priceUSD: meatType.priceUSD,
    priceLBP: meatType.priceLBP
  });
  const [loading, setLoading] = useState(false);
  
  const { language } = useLanguage();
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MEAT_TYPE_BY_ID(meatType._id)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم تحديث نوع اللحم بنجاح!' : 'Meat type updated successfully!');
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في تحديث نوع اللحم' : 'Error updating meat type'));
      }
    } catch (error) {
      console.error('Error updating meat type:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'تعديل نوع اللحم' : 'Edit Meat Type'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'اسم نوع اللحم (إنجليزي)' : 'Meat Type Name (English)'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'اسم نوع اللحم (عربي)' : 'Meat Type Name (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'وصف نوع اللحم (إنجليزي)' : 'Meat Type Description (English)'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'وصف نوع اللحم (عربي)' : 'Meat Type Description (Arabic)'}
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'السعر (دولار)' : 'Price (USD)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceUSD}
                  onChange={(e) => setFormData({...formData, priceUSD: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'السعر (ليرة)' : 'Price (LBP)'}
                </label>
                <input
                  type="number"
                  value={formData.priceLBP}
                  onChange={(e) => setFormData({...formData, priceLBP: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeatTypeManager;
