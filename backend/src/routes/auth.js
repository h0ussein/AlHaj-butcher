import express from 'express';
import { register, login, verifyEmail, resendVerification, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/resend-verification', resendVerification);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

export default router;
