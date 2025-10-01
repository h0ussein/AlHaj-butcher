import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createCategory);
router.put('/:id', authenticateToken, requireAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export default router;
