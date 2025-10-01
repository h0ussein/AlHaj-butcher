import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter((_, index) => index !== action.payload)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item, index) =>
          index === action.payload.index ? { ...item, ...action.payload.updates } : item
        )
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  // Load cart from localStorage on initialization
  const getInitialCart = () => {
    try {
      const savedCart = localStorage.getItem('butcher-shop-cart');
      return savedCart ? JSON.parse(savedCart) : { items: [] };
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return { items: [] };
    }
  };

  const [cart, dispatch] = useReducer(cartReducer, getInitialCart());

  // Save cart to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('butcher-shop-cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (product, orderType, amountType, amount, quantity, selectedMeatType) => {
    let amountUSD = 0;
    let amountLBP = 0;

    if (orderType === 'amount') {
      // Amount-based order
      if (amountType === 'USD') {
        amountUSD = parseFloat(amount);
      } else {
        amountLBP = parseFloat(amount);
      }
    } else if (orderType === 'quantity') {
      // Quantity-based order - calculate based on meat type price or product price
      const qty = parseFloat(quantity);
      let priceUSD = product.priceUSD;
      let priceLBP = product.priceLBP;

      // Use meat type price if available
      if (selectedMeatType && product.meatTypes) {
        const meatType = product.meatTypes.find(mt => mt._id === selectedMeatType);
        if (meatType) {
          priceUSD = meatType.priceUSD;
          priceLBP = meatType.priceLBP;
        }
      }

      amountUSD = qty * priceUSD;
      amountLBP = qty * priceLBP;
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        orderType,
        amountType,
        amount,
        quantity,
        selectedMeatType,
        amountUSD,
        amountLBP
      }
    });
  };

  const removeFromCart = (index) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: index });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const updateItem = (index, updates) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { index, updates } });
  };

  const getTotalItems = () => {
    return cart.items.length;
  };

  const getTotalAmount = async (deliveryApplied = false) => {
    try {
      // Get exchange rates from settings
      const response = await fetch('http://localhost:5001/api/settings');
      const settings = await response.json();
      const usdToLbpRate = settings.exchangeRateUSDToLBP || 90000; // USD to LBP rate
      const lbpToUsdRate = settings.exchangeRateLBPToUSD || 89000; // LBP to USD rate

      let totalUSD = 0;
      let totalLBP = 0;

      cart.items.forEach(item => {
        // Always sum native USD
        totalUSD += item.amountUSD || 0;

        if (item.amountLBP > 0) {
          // Sum native LBP
          totalLBP += item.amountLBP;
          // If this item doesn't already contribute USD (LBP amount-based), convert to USD
          if (!(item.amountUSD > 0)) {
            totalUSD += item.amountLBP / lbpToUsdRate;
          }
        } else if (item.amountUSD > 0 && item.orderType === 'amount' && item.amountType === 'USD') {
          // USD amount-based order - also convert to LBP using USD→LBP rate
          totalLBP += item.amountUSD * usdToLbpRate;
        }
      });

      // Delivery fee (LBP) - affects both currencies
      if (deliveryApplied) {
        totalLBP += 100000;
        // Convert delivery fee to USD and add to total USD
        const deliveryFeeUSD = 100000 / lbpToUsdRate;
        totalUSD += deliveryFeeUSD;
      }

      // Handle cents properly
      const cents = (totalUSD % 1) * 100;
      if (cents > 30) {
        // If more than 30 cents, round up to next dollar
        totalUSD = Math.ceil(totalUSD);
      } else {
        // If 30 cents or less, clear the cents
        totalUSD = Math.floor(totalUSD);
      }

      // Normalize totals
      totalLBP = Math.round(totalLBP);

      return { totalUSD, totalLBP };
    } catch (error) {
      console.error('Error getting total amount:', error);
      // Fallback calculation without exchange rate
      let totalUSD = cart.items.reduce((sum, item) => sum + (item.amountUSD || 0), 0);
      let totalLBP = cart.items.reduce((sum, item) => sum + (item.amountLBP || 0), 0);
      
      // Add delivery fee if applied
      if (deliveryApplied) {
        totalLBP += 100000;
        // Approximate delivery fee in USD (100,000 LBP ≈ $1.12 USD at 89,000 rate)
        totalUSD += 1.12;
      }
      
      // Handle cents properly
      const cents = (totalUSD % 1) * 100;
      if (cents > 30) {
        totalUSD = Math.ceil(totalUSD);
      } else {
        totalUSD = Math.floor(totalUSD);
      }
      
      return { totalUSD, totalLBP };
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateItem,
    getTotalItems,
    getTotalAmount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
