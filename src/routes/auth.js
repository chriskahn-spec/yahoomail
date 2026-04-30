import express from 'express';
import { login, verifyOTP, logout, getCurrentUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getCurrentUser);

export default router;