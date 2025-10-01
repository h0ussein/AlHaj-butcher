import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { getAllUsers, banUser, unbanUser } from '../controllers/userController.js';

const router = express.Router();

// Admin routes for user management
router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.put('/:id/ban', authenticateToken, requireAdmin, banUser);
router.put('/:id/unban', authenticateToken, requireAdmin, unbanUser);

export default router;
