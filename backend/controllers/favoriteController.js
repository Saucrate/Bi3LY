const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const Store = require('../models/Store');
const asyncHandler = require('express-async-handler');
const UserActivity = require('../models/UserActivity');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Add product to favorites
// @route   POST /api/favorites/products/:productId
// @access  Private/Client
exports.addProductToFavorites = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  // Find user's favorites or create new one
  let favorites = await Favorite.findOne({ user: req.user._id });
  if (!favorites) {
    favorites = await Favorite.create({
      user: req.user._id,
      products: [],
      stores: []
    });
  }

  // Check if product already in favorites
  if (favorites.products.includes(productId)) {
    return res.status(400).json({
      success: false,
      error: 'Product already in favorites'
    });
  }

  favorites.products.push(productId);
  await favorites.save();

  // Populate product details
  await favorites.populate('products', 'name price images');

  res.status(201).json({
    success: true,
    data: favorites
  });
});

// @desc    Add store to favorites
// @route   POST /api/favorites/stores/:storeId
// @access  Private/Client
exports.addStoreToFavorites = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;

  // Check if store exists
  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Store not found'
    });
  }

  // Find user's favorites or create new one
  let favorites = await Favorite.findOne({ user: req.user._id });
  if (!favorites) {
    favorites = await Favorite.create({
      user: req.user._id,
      products: [],
      stores: []
    });
  }

  // Check if store already in favorites
  if (favorites.stores.includes(storeId)) {
    return res.status(400).json({
      success: false,
      error: 'Store already in favorites'
    });
  }

  favorites.stores.push(storeId);
  await favorites.save();

  // Populate store details
  await favorites.populate('stores', 'name logo banner');

  res.status(201).json({
    success: true,
    data: favorites
  });
});

// @desc    Get favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res) => {
  const userActivity = await UserActivity.findOne({ user: req.user._id })
    .populate({
      path: 'favorites',
      populate: [
        { path: 'store', select: 'name' },
        { path: 'brand', select: 'name' }
      ]
    });

  if (!userActivity) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  res.status(200).json({
    success: true,
    data: userActivity.favorites || []
  });
});

// @desc    Remove product from favorites
// @route   DELETE /api/favorites/products/:productId
// @access  Private/Client
exports.removeProductFromFavorites = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  const favorites = await Favorite.findOne({ user: req.user._id });
  if (!favorites) {
    return res.status(404).json({
      success: false,
      error: 'Favorites not found'
    });
  }

  favorites.products = favorites.products.filter(
    id => id.toString() !== productId
  );

  await favorites.save();

  // Populate details
  await favorites.populate('products', 'name price images');
  await favorites.populate('stores', 'name logo banner');

  res.json({
    success: true,
    data: favorites
  });
});

// @desc    Remove store from favorites
// @route   DELETE /api/favorites/stores/:storeId
// @access  Private/Client
exports.removeStoreFromFavorites = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;

  const favorites = await Favorite.findOne({ user: req.user._id });
  if (!favorites) {
    return res.status(404).json({
      success: false,
      error: 'Favorites not found'
    });
  }

  favorites.stores = favorites.stores.filter(
    id => id.toString() !== storeId
  );

  await favorites.save();

  // Populate details
  await favorites.populate('products', 'name price images');
  await favorites.populate('stores', 'name logo banner');

  res.json({
    success: true,
    data: favorites
  });
});

// @desc    Toggle favorite
// @route   POST /api/favorites/toggle/:productId
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user._id;

  // Detaylı loglama ekleyelim
  console.log('=== Toggle Favorite Request ===');
  console.log('User ID:', userId);
  console.log('Product ID:', productId);

  let userActivity = await UserActivity.findOne({ user: userId });
  console.log('Existing user activity:', userActivity ? 'Found' : 'Not found');

  if (!userActivity) {
    userActivity = await UserActivity.create({ user: userId });
    console.log('New user activity created');
  }

  const isFavorite = userActivity.favorites.includes(productId);
  console.log('Is product already favorite:', isFavorite);
  
  if (isFavorite) {
    userActivity.favorites = userActivity.favorites.filter(id => id.toString() !== productId);
    console.log('Removed from favorites');
  } else {
    userActivity.favorites.push(productId);
    console.log('Added to favorites');
  }

  await userActivity.save();
  console.log('User activity saved successfully');
  console.log('Updated favorites count:', userActivity.favorites.length);
  console.log('=== End Toggle Favorite ===');

  res.status(200).json({
    success: true,
    data: {
      isFavorite: !isFavorite,
      favorites: userActivity.favorites
    }
  });
});

// @desc    Check if product is favorite
// @route   GET /api/favorites/check/:productId
// @access  Private
exports.checkFavorite = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const userActivity = await UserActivity.findOne({ user: req.user._id });

  const isFavorite = userActivity ? userActivity.favorites.includes(productId) : false;

  res.status(200).json({
    success: true,
    data: { isFavorite }
  });
});

// @desc    Clear all favorites
// @route   DELETE /api/favorites/clear
// @access  Private
exports.clearFavorites = asyncHandler(async (req, res) => {
  const userActivity = await UserActivity.findOne({ user: req.user._id });
  
  if (userActivity) {
    userActivity.favorites = [];
    await userActivity.save();
  }

  res.status(200).json({
    success: true,
    message: 'All favorites cleared'
  });
}); 