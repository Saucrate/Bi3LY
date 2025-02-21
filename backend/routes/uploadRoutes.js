import express from 'express';
import { uploadFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import fileUpload from 'express-fileupload';

const router = express.Router();

router.use(fileUpload({
  useTempFiles: true,
}));

router.post('/', protect, uploadFile);

export default router; 