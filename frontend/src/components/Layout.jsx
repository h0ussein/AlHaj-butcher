import React, { useState } from 'react';
import logoImg from '../assets/logo.jpg';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Toaster } from 'react-hot-toast';
import Cart from './Cart';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { getTotalItems } = useCart();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoImg}
                alt={language === 'ar' ? 'شعار ملحمة الحاج' : 'AlHaj Butcher Logo'}
                className="h-10 w-auto rounded-md shadow-sm object-contain"
              />
              <div className="block text-xl sm:text-2xl font-bold text-red-600">
                {language === 'ar' ? 'ملحمة الحاج' : 'Butcher AlHaj'}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              {user?.role !== 'admin' && (
                <>
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/') 
                        ? 'bg-red-100 text-red-700' 
                        : 'text-gray-700 hover:text-red-600'
                    }`}
                  >
                    {t('welcome')}
                  </Link>
                  
                  {isAuthenticated && (
                    <>
                      <Link
                        to="/products"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/products') 
                            ? 'bg-red-100 text-red-700' 
                            : 'text-gray-700 hover:text-red-600'
                        }`}
                      >
                        {t('products')}
                      </Link>
                      
                      <Link
                        to="/orders"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/orders') 
                            ? 'bg-red-100 text-red-700' 
                            : 'text-gray-700 hover:text-red-600'
                        }`}
                      >
                        {t('myOrders')}
                      </Link>
                    </>
                  )}
                </>
              )}
              
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin') 
                      ? 'bg-red-100 text-red-700' 
                      : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  {language === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
                </Link>
              )}
            </nav>

            {/* Right Side - Language, Cart, Auth */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Language Selector */}
              <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                    language === 'en' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                    language === 'ar' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  عربي
                </button>
              </div>

              {/* Cart Button - Only for customers */}
              {isAuthenticated && user?.role !== 'admin' && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1 sm:space-x-2"
                >
                  <span>🛒</span>
                  <span className="hidden sm:inline">{language === 'ar' ? 'السلة' : 'Cart'}</span>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              )}

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {t('welcome')}, {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-red-600 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {user?.role !== 'admin' && (
                  <>
                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/') 
                          ? 'bg-red-100 text-red-700' 
                          : 'text-gray-700 hover:text-red-600'
                      }`}
                    >
                      {t('welcome')}
                    </Link>
                    
                    {isAuthenticated && (
                      <>
                        <Link
                          to="/products"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive('/products') 
                              ? 'bg-red-100 text-red-700' 
                              : 'text-gray-700 hover:text-red-600'
                          }`}
                        >
                          {t('products')}
                        </Link>
                        
                        <Link
                          to="/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive('/orders') 
                              ? 'bg-red-100 text-red-700' 
                              : 'text-gray-700 hover:text-red-600'
                          }`}
                        >
                          {t('myOrders')}
                        </Link>
                      </>
                    )}
                  </>
                )}
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin') 
                        ? 'bg-red-100 text-red-700' 
                        : 'text-gray-700 hover:text-red-600'
                    }`}
                  >
                    {language === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
                  </Link>
                )}

                {/* Mobile Auth Section */}
                {!isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600"
                    >
                      {t('login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                    >
                      {t('register')}
                    </Link>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="px-3 py-2 text-sm text-gray-700">
                      {t('welcome')}, {user?.name}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                    >
                      {t('logout')}
                    </button>
                  </div>
                )}

                {/* Mobile Language Selector */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 px-3 py-1 text-sm rounded-md transition-colors ${
                        language === 'en' 
                          ? 'bg-white text-red-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage('ar')}
                      className={`flex-1 px-3 py-1 text-sm rounded-md transition-colors ${
                        language === 'ar' 
                          ? 'bg-white text-red-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      عربي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              © 2024 {language === 'ar' ? 'متجر الجزارة' : 'Butcher Shop'}. {t('qualityService')}.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Modal */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Layout;
