import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';
import MeatTypeManager from './MeatTypeManager';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [managingMeatTypes, setManagingMeatTypes] = useState(null);
  
  const { t, language } = useLanguage();
  const { token } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCTS));
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.CATEGORIES));
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const toggleProductAvailability = async (productId) => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCT_BY_ID(productId) + '/toggle-availability'), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم تحديث حالة المنتج' : 'Product availability updated');
        fetchProducts();
      } else {
        toast.error(language === 'ar' ? 'خطأ في تحديث المنتج' : 'Error updating product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCT_BY_ID(productId)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم حذف المنتج بنجاح!' : 'Product deleted successfully!');
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في حذف المنتج' : 'Error deleting product'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    }
  };

  const getProductName = (product) => {
    return language === 'ar' ? product.nameAr : product.name;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? (language === 'ar' ? category.nameAr : category.name) : 'N/A';
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
          {language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'المنتج' : 'Product'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'أنواع اللحم' : 'Meat Types'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getProductName(product)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.description && (language === 'ar' ? product.descriptionAr : product.description)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryName(product.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      {product.meatTypes && product.meatTypes.length > 0 ? (
                        product.meatTypes.map((meatType, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {language === 'ar' ? meatType.nameAr : meatType.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ${meatType.priceUSD}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          {language === 'ar' ? 'لا توجد أنواع لحم' : 'No meat types'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isAvailable 
                        ? (language === 'ar' ? 'متوفر' : 'Available')
                        : (language === 'ar' ? 'غير متوفر' : 'Unavailable')
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => toggleProductAvailability(product._id)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        product.isAvailable
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {product.isAvailable 
                        ? (language === 'ar' ? 'إخفاء' : 'Hide')
                        : (language === 'ar' ? 'إظهار' : 'Show')
                      }
                    </button>
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="bg-blue-100 text-blue-800 px-3 py-1 text-xs rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => setManagingMeatTypes(product)}
                      className="bg-green-100 text-green-800 px-3 py-1 text-xs rounded-full hover:bg-green-200 transition-colors"
                    >
                      {language === 'ar' ? 'أنواع اللحم' : 'Meat Types'}
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="bg-red-100 text-red-800 px-3 py-1 text-xs rounded-full hover:bg-red-200 transition-colors"
                    >
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <AddProductModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchProducts();
          }}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            fetchProducts();
          }}
        />
      )}

      {managingMeatTypes && (
        <MeatTypeManager
          product={managingMeatTypes}
          onClose={() => setManagingMeatTypes(null)}
          onSuccess={() => {
            setManagingMeatTypes(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

// Add Product Modal Component
const AddProductModal = ({ categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    category: '',
    priceUSD: '',
    priceLBP: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { language } = useLanguage();
  const { token } = useAuth();

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(buildApiUrl(API_ENDPOINTS.UPLOAD), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.imageUrl]
        }));
        toast.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
      } else {
        toast.error(language === 'ar' ? 'خطأ في رفع الصورة' : 'Error uploading image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCTS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const product = await response.json();
        toast.success(language === 'ar' ? 'تم إضافة المنتج بنجاح!' : 'Product added successfully!');
        onSuccess();
        // Open meat type management for the new product
        setTimeout(() => {
          window.open(`/admin/products/${product._id}/meat-types`, '_blank');
        }, 1000);
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في إضافة المنتج' : 'Error adding product'));
      }
    } catch (error) {
      console.error('Error creating product:', error);
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
              {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}
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
                {language === 'ar' ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}
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
                {language === 'ar' ? 'وصف المنتج (إنجليزي)' : 'Product Description (English)'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'أدخل وصف المنتج باللغة الإنجليزية' : 'Enter product description in English'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'وصف المنتج (عربي)' : 'Product Description (Arabic)'}
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'أدخل وصف المنتج باللغة العربية' : 'Enter product description in Arabic'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {language === 'ar' ? category.nameAr : category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'السعر الأساسي (دولار)' : 'Base Price (USD)'}
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
                  {language === 'ar' ? 'السعر الأساسي (ليرة)' : 'Base Price (LBP)'}
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'صور المنتج' : 'Product Images'}
              </label>
              
              {/* Image Upload Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploadingImage}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-gray-500">
                    {uploadingImage ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        <span>{language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
                      </div>
                    ) : (
                      <div>
                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-sm">
                          {language === 'ar' ? 'اضغط لرفع صورة' : 'Click to upload image'}
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Display Uploaded Images */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                {language === 'ar' 
                  ? 'بعد إضافة المنتج، ستتمكن من إضافة أنواع اللحم المختلفة (1-3 أنواع)'
                  : 'After adding the product, you can add different meat types (1-3 types)'
                }
              </p>
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

// Edit Product Modal Component
const EditProductModal = ({ product, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    nameAr: product.nameAr,
    description: product.description || '',
    descriptionAr: product.descriptionAr || '',
    category: product.category._id || product.category,
    priceUSD: product.priceUSD,
    priceLBP: product.priceLBP,
    images: product.images || []
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { language } = useLanguage();
  const { token } = useAuth();

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(buildApiUrl(API_ENDPOINTS.UPLOAD), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.imageUrl]
        }));
        toast.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
      } else {
        toast.error(language === 'ar' ? 'خطأ في رفع الصورة' : 'Error uploading image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCT_BY_ID(product._id)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم تحديث المنتج بنجاح!' : 'Product updated successfully!');
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.message || (language === 'ar' ? 'خطأ في تحديث المنتج' : 'Error updating product'));
      }
    } catch (error) {
      console.error('Error updating product:', error);
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
              {language === 'ar' ? 'تعديل المنتج' : 'Edit Product'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}
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
                {language === 'ar' ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}
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
                {language === 'ar' ? 'وصف المنتج (إنجليزي)' : 'Product Description (English)'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'أدخل وصف المنتج باللغة الإنجليزية' : 'Enter product description in English'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'وصف المنتج (عربي)' : 'Product Description (Arabic)'}
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={language === 'ar' ? 'أدخل وصف المنتج باللغة العربية' : 'Enter product description in Arabic'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {language === 'ar' ? category.nameAr : category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'السعر الأساسي (دولار)' : 'Base Price (USD)'}
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
                  {language === 'ar' ? 'السعر الأساسي (ليرة)' : 'Base Price (LBP)'}
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'صور المنتج' : 'Product Images'}
              </label>
              
              {/* Image Upload Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploadingImage}
                  className="hidden"
                  id="edit-image-upload"
                />
                <label
                  htmlFor="edit-image-upload"
                  className={`cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-gray-500">
                    {uploadingImage ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        <span>{language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
                      </div>
                    ) : (
                      <div>
                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-sm">
                          {language === 'ar' ? 'اضغط لرفع صورة' : 'Click to upload image'}
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Display Uploaded Images */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-3 rounded-md">
              <p className="text-sm text-yellow-800">
                {language === 'ar' 
                  ? 'لإدارة أنواع اللحم، استخدم زر "تعديل" في الجدول'
                  : 'To manage meat types, use the "Edit" button in the table'
                }
              </p>
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

export default AdminProducts;