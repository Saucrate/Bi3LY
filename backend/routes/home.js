const express = require('express');
const {
  getHomeData,
  trackActivity,
  getActivitySummary,
  updatePreferences,
  getCategoryProducts,
  getCategories,
  getSpecialStores,
  getSpecialProducts,
  getDiscountedProducts,
  getMostSoldStores,
  getMostSoldProducts,
  getBrands,
  searchProducts
} = require('../controllers/HomeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Ana sayfa verilerini getir
router.get('/', protect, getHomeData);

// Kullanıcı aktivitelerini takip et (giriş yapılmış olmalı)
router.post('/track', protect, trackActivity);

// Kullanıcı aktivite özetini getir (giriş yapılmış olmalı)
router.get('/activity-summary', protect, getActivitySummary);

// Kullanıcı tercihlerini güncelle (giriş yapılmış olmalı)
router.put('/preferences', protect, updatePreferences);

// Kategori ürünlerini getir
router.get('/categories/:categoryId/products', getCategoryProducts);

// Diğer endpoint'ler
router.get('/categories', getCategories);
router.get('/special-stores', getSpecialStores);
router.get('/special-products', getSpecialProducts);
router.get('/discounted-products', getDiscountedProducts);
router.get('/most-sold-stores', getMostSoldStores);
router.get('/most-sold-products', getMostSoldProducts);
router.get('/brands', getBrands);

// Ürün arama endpoint'i
router.get('/search/products', searchProducts);

module.exports = router; 