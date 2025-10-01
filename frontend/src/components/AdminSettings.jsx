import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exchangeRateUSDToLBP, setExchangeRateUSDToLBP] = useState('');
  const [exchangeRateLBPToUSD, setExchangeRateLBPToUSD] = useState('');
  const [minOrderAmountLBP, setMinOrderAmountLBP] = useState('');
  const [minOrderAmountUSD, setMinOrderAmountUSD] = useState('');
  
  // WhatsApp test states
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  
  // User management states
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  const { language } = useLanguage();
  const { token } = useAuth();

  useEffect(() => {
    fetchSettings();
    fetchUsers();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SETTINGS));
      const data = await response.json();
      setSettings(data);
      setExchangeRateUSDToLBP(data.exchangeRateUSDToLBP || data.exchangeRate || 90000);
      setExchangeRateLBPToUSD(data.exchangeRateLBPToUSD || data.exchangeRate || 89000);
      setMinOrderAmountLBP(data.minOrderAmountLBP);
      setMinOrderAmountUSD(data.minOrderAmountUSD);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(language === 'ar' ? 'خطأ في تحميل الإعدادات' : 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const updateExchangeRates = async () => {
    if (!exchangeRateUSDToLBP || exchangeRateUSDToLBP <= 0 || !exchangeRateLBPToUSD || exchangeRateLBPToUSD <= 0) {
      toast.error(language === 'ar' ? 'يرجى إدخال أسعار صرف صحيحة' : 'Please enter valid exchange rates');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.EXCHANGE_RATES), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          exchangeRateUSDToLBP: parseFloat(exchangeRateUSDToLBP),
          exchangeRateLBPToUSD: parseFloat(exchangeRateLBPToUSD)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success(language === 'ar' ? 'تم تحديث أسعار الصرف بنجاح' : 'Exchange rates updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || (language === 'ar' ? 'خطأ في تحديث سعر الصرف' : 'Error updating exchange rate'));
      }
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const updateMinOrderAmounts = async () => {
    if ((minOrderAmountLBP && minOrderAmountLBP < 0) || (minOrderAmountUSD && minOrderAmountUSD < 0)) {
      toast.error(language === 'ar' ? 'يرجى إدخال حدود أدنى صحيحة' : 'Please enter valid minimum amounts');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MIN_ORDER_AMOUNT), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          minOrderAmountLBP: minOrderAmountLBP ? parseInt(minOrderAmountLBP) : undefined,
          minOrderAmountUSD: minOrderAmountUSD ? parseFloat(minOrderAmountUSD) : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success(language === 'ar' ? 'تم تحديث الحدود الأدنى للطلب بنجاح' : 'Minimum order amounts updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || (language === 'ar' ? 'خطأ في تحديث الحدود الأدنى' : 'Error updating minimum amounts'));
      }
    } catch (error) {
      console.error('Error updating minimum amounts:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const sendTestWhatsAppMessage = async () => {
    if (!testPhoneNumber || !testMessage) {
      toast.error(language === 'ar' ? 'يرجى إدخال رقم الهاتف والرسالة' : 'Please enter phone number and message');
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.WHATSAPP_TEST), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber,
          message: testMessage
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(language === 'ar' ? 'تم إرسال رسالة WhatsApp بنجاح' : 'WhatsApp message sent successfully');
        setTestMessage('');
      } else {
        throw new Error(result.message || 'Failed to send WhatsApp message');
      }
    } catch (error) {
      console.error('Error sending test WhatsApp message:', error);
      toast.error(language === 'ar' ? 'خطأ في إرسال رسالة WhatsApp' : 'Error sending WhatsApp message');
    } finally {
      setSendingTest(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch(buildApiUrl(API_ENDPOINTS.USERS), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const error = await response.json();
        toast.error(error.message || (language === 'ar' ? 'خطأ في تحميل المستخدمين' : 'Error loading users'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setUsersLoading(false);
    }
  };

  const toggleUserBan = async (userId, isBanned) => {
    try {
      const endpoint = isBanned ? API_ENDPOINTS.BAN_USER(userId) : API_ENDPOINTS.UNBAN_USER(userId);
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success(isBanned ? (language === 'ar' ? 'تم حظر المستخدم' : 'User banned') : (language === 'ar' ? 'تم إلغاء حظر المستخدم' : 'User unbanned'));
        fetchUsers(); // Refresh user list
      } else {
        const error = await response.json();
        toast.error(error.message || (language === 'ar' ? 'خطأ في تحديث حالة المستخدم' : 'Error updating user status'));
      }
    } catch (error) {
      console.error('Error toggling user ban:', error);
      toast.error(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    }
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'إعدادات النظام' : 'System Settings'}
        </h2>
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'إدارة سعر الصرف والحد الأدنى للطلبات'
            : 'Manage exchange rate and minimum order amounts'
          }
        </p>
      </div>

      {/* Current Settings */}
      {settings && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ar' ? 'الإعدادات الحالية' : 'Current Settings'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                {language === 'ar' ? 'سعر الصرف (دولار إلى ليرة)' : 'Exchange Rate (USD to LBP)'}
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                1$ = {formatNumber(settings.exchangeRateUSDToLBP || settings.exchangeRate)} LBP
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'ar' ? 'آخر تحديث' : 'Last updated'}: {new Date(settings.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                {language === 'ar' ? 'سعر الصرف (ليرة إلى دولار)' : 'Exchange Rate (LBP to USD)'}
              </h4>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(settings.exchangeRateLBPToUSD || settings.exchangeRate)} LBP = 1$
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'ar' ? 'آخر تحديث' : 'Last updated'}: {new Date(settings.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                {language === 'ar' ? 'الحدود الأدنى للطلب' : 'Minimum Order Amounts'}
              </h4>
              <div className="space-y-2">
                <p className="text-xl font-bold text-green-600">
                  {formatNumber(settings.minOrderAmountLBP)} LBP
                </p>
                <p className="text-xl font-bold text-blue-600">
                  ${settings.minOrderAmountUSD} USD
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'ar' ? 'آخر تحديث' : 'Last updated'}: {new Date(settings.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Update Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exchange Rates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ar' ? 'تحديث أسعار الصرف' : 'Update Exchange Rates'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'سعر الصرف (1 دولار = كم ليرة)' : 'Exchange Rate (1 USD = ? LBP)'}
              </label>
              <input
                type="number"
                value={exchangeRateUSDToLBP}
                onChange={(e) => setExchangeRateUSDToLBP(e.target.value)}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="90000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'سعر الصرف (كم ليرة = 1 دولار)' : 'Exchange Rate (? LBP = 1 USD)'}
              </label>
              <input
                type="number"
                value={exchangeRateLBPToUSD}
                onChange={(e) => setExchangeRateLBPToUSD(e.target.value)}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="89000"
              />
            </div>
            <button
              onClick={updateExchangeRates}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'تحديث أسعار الصرف' : 'Update Exchange Rates')}
            </button>
          </div>
        </div>

        {/* Minimum Order Amounts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ar' ? 'تحديث الحدود الأدنى للطلب' : 'Update Minimum Order Amounts'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'الحد الأدنى بالدولار الأمريكي' : 'Minimum Amount in USD'}
              </label>
              <input
                type="number"
                value={minOrderAmountUSD}
                onChange={(e) => setMinOrderAmountUSD(e.target.value)}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'الحد الأدنى بالليرة اللبنانية' : 'Minimum Amount in Lebanese Lira'}
              </label>
              <input
                type="number"
                value={minOrderAmountLBP}
                onChange={(e) => setMinOrderAmountLBP(e.target.value)}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="200000"
              />
            </div>
            <button
              onClick={updateMinOrderAmounts}
              disabled={saving}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'تحديث الحدود الأدنى' : 'Update Minimum Amounts')}
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Test Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'ar' ? 'اختبار رسائل WhatsApp' : 'WhatsApp Message Test'}
        </h3>
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            <strong>{language === 'ar' ? 'رقم المرسل:' : 'Sender Number:'}</strong> +96176878301
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ar' ? 'رقم الهاتف المستقبل' : 'Recipient Phone Number'}
            </label>
            <input
              type="tel"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+96170123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ar' ? 'الرسالة' : 'Message'}
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={language === 'ar' ? 'اكتب رسالة الاختبار هنا...' : 'Type your test message here...'}
            />
          </div>
          <button
            onClick={sendTestWhatsAppMessage}
            disabled={sendingTest}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {sendingTest ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال رسالة اختبار' : 'Send Test Message')}
          </button>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
        </h3>
        {usersLoading ? (
          <div className="text-center text-gray-500">{language === 'ar' ? 'جاري تحميل المستخدمين...' : 'Loading users...'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الهاتف' : 'Mobile'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName} ({user.fatherName})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.isBanned ? (language === 'ar' ? 'محظور' : 'Banned') : (language === 'ar' ? 'نشط' : 'Active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleUserBan(user._id, !user.isBanned)}
                        className={`ml-2 px-3 py-1 rounded-md text-white text-xs ${user.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                      >
                        {user.isBanned ? (language === 'ar' ? 'إلغاء الحظر' : 'Unban') : (language === 'ar' ? 'حظر' : 'Ban')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
