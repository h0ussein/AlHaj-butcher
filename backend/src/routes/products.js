import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability
} from '../controllers/productController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);
router.patch('/:id/toggle-availability', authenticateToken, requireAdmin, toggleProductAvailability);

export default router;
