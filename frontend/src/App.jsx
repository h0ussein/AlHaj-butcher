import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyEmailNotice from './pages/VerifyEmailNotice';

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                  <Route path="/verify-email-sent" element={<VerifyEmailNotice />} />
                </Routes>
              </Layout>
            </Router>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
