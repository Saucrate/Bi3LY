const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
  getStoreStats,
  getStoreProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getStoreProfile,
  updateStoreProfile,
  getOrders,
  updateOrderStatus,
  getDetailedStats,
  getBrands,
  addBrand,
  getColors,
  addColor,
  getSizes,
  addSize,
  getTags,
  addTag,
  getCategories,
  getProductDetail
} = require('../controllers/sellerController');
const {
  createRequest,
  getSellerRequests,
  getRequestById
} = require('../controllers/requestController');

// Multer konfigürasyonu
const storage = multer.memoryStorage();
const uploadConfig = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // maksimum 5 dosya
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Farklı upload middleware'leri
const productUpload = uploadConfig.array('images', 5);
const storeUpload = uploadConfig.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// Multer hata yakalama middleware'i
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
};

// Ürün route'ları için middleware
const handleProductUpload = (req, res, next) => {
  productUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    next();
  });
};

// Store route'ları için middleware
const handleStoreUpload = (req, res, next) => {
  storeUpload(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

// Temel route'lar
router.get('/stats', protect, authorize('seller'), getStoreStats);
router.get('/products', protect, authorize('seller'), getStoreProducts);
router.post('/products', protect, authorize('seller'), handleProductUpload, addProduct);
router.put('/products/:id', protect, authorize('seller'), handleProductUpload, updateProduct);
router.delete('/products/:id', protect, authorize('seller'), deleteProduct);

// Yeni route'lar
router.get('/brands', protect, authorize('seller'), getBrands);
router.post('/brands', protect, authorize('seller'), addBrand);

router.get('/colors', protect, authorize('seller'), getColors);
router.post('/colors', protect, authorize('seller'), addColor);

router.get('/sizes', protect, authorize('seller'), getSizes);
router.post('/sizes', protect, authorize('seller'), addSize);

router.get('/tags', protect, authorize('seller'), getTags);
router.post('/tags', protect, authorize('seller'), addTag);

router.get('/categories', protect, authorize('seller'), getCategories);

// Tekil ürün detayı için route'u en üste ekleyelim (spesifik route'lar üstte olmalı)
router.get('/products/:id', protect, authorize('seller'), getProductDetail);

// Diğer route'lar
router.get('/profile', protect, authorize('seller'), getStoreProfile);
router.put('/profile', protect, authorize('seller'), handleStoreUpload, updateStoreProfile);
router.get('/orders', protect, authorize('seller'), getOrders);
router.put('/orders/:id', protect, authorize('seller'), updateOrderStatus);
router.get('/detailed-stats', protect, authorize('seller'), getDetailedStats);

// Request routes
router.post('/requests', protect, authorize('seller'), handleProductUpload, createRequest);
router.get('/requests', protect, authorize('seller'), getSellerRequests);
router.get('/requests/:id', protect, authorize('seller'), getRequestById);

module.exports = router; 