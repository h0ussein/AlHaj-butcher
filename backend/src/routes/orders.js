import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, createOrder);
router.get('/my-orders', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrderById);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteOrder);

export default router;
