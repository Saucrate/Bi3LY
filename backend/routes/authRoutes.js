import express from 'express';
import { sendVerificationCode, verifyUser, registerUser } from '../controllers/authController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/send-verification-code', sendVerificationCode);
router.post('/verify', verifyUser);
router.post('/register', upload.fields([{ name: 'document1' }, { name: 'document2' }]), registerUser);

export default router;
