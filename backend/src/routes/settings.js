import express from 'express';
import { getSettings, updateExchangeRate, updateExchangeRates, updateMinOrderAmount } from '../controllers/settingsController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSettings);

// Admin routes
router.put('/exchange-rate', authenticateToken, requireAdmin, updateExchangeRate);
router.put('/exchange-rates', authenticateToken, requireAdmin, updateExchangeRates);
router.put('/min-order-amount', authenticateToken, requireAdmin, updateMinOrderAmount);

export default router;
