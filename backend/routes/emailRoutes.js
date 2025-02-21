import express from 'express';
import { sendEmail } from '../controllers/emailController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendEmail);

export default router; 