import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  const translations = {
    en: {
      // Dashboard
      welcome: 'Welcome to Our Butcher Shop',
      selectLanguage: 'Select Language',
      startOrdering: 'Start Ordering',
      aboutUs: 'About Us',
      freshMeat: 'Fresh Meat Daily',
      qualityService: 'Quality & Service',
      
      // Auth
      register: 'Register',
      login: 'Login',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      mobile: 'Mobile Number',
      confirmPassword: 'Confirm Password',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      registerSuccess: 'Registration successful! Please check your email for verification.',
      loginSuccess: 'Login successful!',
      
      // Products
      products: 'Products',
      categories: 'Categories',
      price: 'Price',
      quantity: 'Quantity',
      available: 'Available',
      notAvailable: 'Not Available',
      addToOrder: 'Add to Order',
      
      // Orders
      myOrders: 'My Orders',
      placeOrder: 'Place Order',
      customOrder: 'Custom Order',
      orderTotal: 'Order Total',
      orderStatus: 'Order Status',
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      completed: 'Completed',
      
      // Common
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      next: 'Next',
      previous: 'Previous'
    },
    ar: {
      // Dashboard
      welcome: 'مرحباً بكم في متجر الجزارة',
      selectLanguage: 'اختر اللغة',
      startOrdering: 'ابدأ الطلب',
      aboutUs: 'من نحن',
      freshMeat: 'لحم طازج يومياً',
      qualityService: 'الجودة والخدمة',
      
      // Auth
      register: 'تسجيل',
      login: 'تسجيل الدخول',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      mobile: 'رقم الهاتف',
      confirmPassword: 'تأكيد كلمة المرور',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      registerSuccess: 'تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني للتحقق.',
      loginSuccess: 'تم تسجيل الدخول بنجاح!',
      
      // Products
      products: 'المنتجات',
      categories: 'الفئات',
      price: 'السعر',
      quantity: 'الكمية',
      available: 'متوفر',
      notAvailable: 'غير متوفر',
      addToOrder: 'أضف للطلب',
      
      // Orders
      myOrders: 'طلباتي',
      placeOrder: 'تأكيد الطلب',
      customOrder: 'طلب مخصص',
      orderTotal: 'إجمالي الطلب',
      orderStatus: 'حالة الطلب',
      pending: 'في الانتظار',
      confirmed: 'مؤكد',
      preparing: 'قيد التحضير',
      ready: 'جاهز',
      completed: 'مكتمل',
      
      // Common
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      cancel: 'إلغاء',
      save: 'حفظ',
      edit: 'تعديل',
      delete: 'حذف',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق'
    }
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
