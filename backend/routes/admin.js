const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { checkDBConnection, queryTimeout } = require('../middleware/db');
const {
  getStatistics,
  getSellers,
  getSellerDetails,
  updateSellerStatus,
  getUsers,
  updateUserStatus,
  getPendingRequests,
  updateRequestStatus,
  getSellerStats,
  getUserDetails,
  getUserStats,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  updateMonthlyTarget,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getPendingProducts,
  approveProduct,
  rejectProduct
} = require('../controllers/adminController');
const upload = require('../middleware/upload');

// Tüm rotalar için admin yetkisi ve DB kontrolü gerekli
router.use(protect);
router.use(authorize('admin'));
router.use(checkDBConnection);
router.use(queryTimeout(30000));

// İstatistik route'ları
router.get('/statistics', getStatistics);
router.put('/statistics/target', updateMonthlyTarget);

// Satıcı yönetimi route'ları
router.get('/sellers', getSellers);
router.get('/sellers/:id', getSellerDetails);
router.put('/sellers/:id/status', updateSellerStatus);
router.get('/sellers/:id/stats', getSellerStats);

// Ürün yönetimi route'ları
router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);

// Kullanıcı yönetimi route'ları
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.get('/users/:id/stats', getUserStats);
router.put('/users/:id/status', updateUserStatus);

// İstek yönetimi route'ları
router.get('/requests', getPendingRequests);
router.put('/requests/:id/status', updateRequestStatus);

// Admin profil route'ları
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.put('/profile/password', updateAdminPassword);

// Kategori yönetimi route'ları
router.get('/categories', getCategories);
router.post('/categories', upload.single('image'), addCategory);
router.put('/categories/:id', upload.single('image'), updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router; 