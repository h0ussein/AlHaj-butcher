import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOnOrdersPage, setIsOnOrdersPage] = useState(false);
  const [notificationInterval, setNotificationInterval] = useState(null);
  const { user, token } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch pending orders count
  const fetchPendingOrdersCount = async () => {
    if (!isAdmin || !token) return;
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ORDERS_BY_STATUS('pending')), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const orders = await response.json();
        setPendingOrdersCount(orders.length);
      }
    } catch (error) {
      console.error('Error fetching pending orders count:', error);
    }
  };

  // Show notification toast
  const showNotificationToast = () => {
    if (pendingOrdersCount > 0 && isAdmin && !isOnOrdersPage) {
      toast.success(
        `🔔 ${pendingOrdersCount} new order${pendingOrdersCount > 1 ? 's' : ''} waiting for your confirmation!`,
        {
          duration: 8000,
          id: 'new-orders-notification', // Same ID to prevent duplicates
          position: 'top-right',
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }
        }
      );
    }
  };

  // Start notification interval
  const startNotificationInterval = () => {
    if (notificationInterval) {
      clearInterval(notificationInterval);
    }

    const interval = setInterval(() => {
      fetchPendingOrdersCount();
      showNotificationToast();
    }, 10000); // Every 10 seconds

    setNotificationInterval(interval);
  };

  // Stop notification interval
  const stopNotificationInterval = () => {
    if (notificationInterval) {
      clearInterval(notificationInterval);
      setNotificationInterval(null);
    }
    // Dismiss any existing toast
    toast.dismiss('new-orders-notification');
  };

  // Start notifications when admin is detected
  useEffect(() => {
    if (isAdmin && token) {
      fetchPendingOrdersCount();
      startNotificationInterval();
    } else {
      stopNotificationInterval();
    }

    return () => {
      stopNotificationInterval();
    };
  }, [isAdmin, token]);

  // Stop notifications when admin is on orders page
  useEffect(() => {
    if (isOnOrdersPage) {
      stopNotificationInterval();
    } else if (isAdmin && token) {
      startNotificationInterval();
    }
  }, [isOnOrdersPage, isAdmin, token]);

  // Update pending orders count when it changes
  useEffect(() => {
    if (pendingOrdersCount > 0 && isAdmin && !isOnOrdersPage) {
      showNotificationToast();
    }
  }, [pendingOrdersCount]);

  const value = {
    pendingOrdersCount,
    setIsOnOrdersPage,
    fetchPendingOrdersCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
