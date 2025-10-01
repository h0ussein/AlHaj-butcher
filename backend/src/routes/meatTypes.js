import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import {
  getMeatTypesByProduct,
  createMeatType,
  updateMeatType,
  deleteMeatType
} from '../controllers/meatTypeController.js';

const router = express.Router();

// Get meat types for a product (public)
router.get('/product/:productId', getMeatTypesByProduct);

// Create meat type (Admin only)
router.post('/', authenticateToken, requireAdmin, createMeatType);

// Update meat type (Admin only)
router.put('/:id', authenticateToken, requireAdmin, updateMeatType);

// Delete meat type (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteMeatType);

export default router;
