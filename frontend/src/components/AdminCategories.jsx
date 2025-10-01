import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { t, language } = useLanguage();
  const { token } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.CATEGORIES));
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category) => {
    return language === 'ar' ? category.nameAr : category.name;
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذه الفئة؟' : 'Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.CATEGORY_BY_ID(categoryId)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم حذف الفئة بنجاح!' : 'Category deleted successfully!');
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في حذف الفئة' : 'Error deleting category'));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'إدارة الفئات' : 'Manage Categories'}
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🥩</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getCategoryName(category)}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'ar' ? category.descriptionAr : category.description}
                </p>
              )}
              <div className="flex justify-center space-x-2">
                <button className="bg-blue-100 text-blue-800 px-3 py-1 text-xs rounded-full hover:bg-blue-200 transition-colors">
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </button>
                <button 
                  onClick={() => deleteCategory(category._id)}
                  className="bg-red-100 text-red-800 px-3 py-1 text-xs rounded-full hover:bg-red-200 transition-colors"
                >
                  {language === 'ar' ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCategories();
          }}
        />
      )}
    </div>
  );
};

// Add Category Modal Component
const AddCategoryModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { language } = useLanguage();
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.CATEGORIES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم إضافة الفئة بنجاح' : 'Category added successfully');
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في إضافة الفئة' : 'Error adding category'));
      }
    } catch (error) {
      console.error('Error adding category:', error);
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
              {language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'اسم الفئة (إنجليزي)' : 'Category Name (English)'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'مثال: Beef' : 'Example: Beef'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'اسم الفئة (عربي)' : 'Category Name (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'مثال: لحم بقري' : 'Example: لحم بقري'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'وصف الفئة...' : 'Category description...'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'وصف الفئة بالعربية...' : 'Category description in Arabic...'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'رابط الصورة (اختياري)' : 'Image URL (Optional)'}
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://example.com/image.jpg"
              />
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

export default AdminCategories;
