const express = require('express');
const {
  getFavorites,
  toggleFavorite,
  checkFavorite,
  clearFavorites
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Tüm rotalar için auth gerekli

router.route('/')
  .get(getFavorites);

router.route('/toggle/:productId')
  .post(toggleFavorite);

router.route('/check/:productId')
  .get(checkFavorite);

router.route('/clear')
  .delete(clearFavorites);

module.exports = router; 