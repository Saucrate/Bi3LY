const Store = require('../models/Store');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../utils/cloudinary');
const Product = require('../models/Product');

// @desc    Create store
// @route   POST /api/stores
// @access  Private/Seller
exports.createStore = asyncHandler(async (req, res) => {
  const { name, description, category, address, businessRegistrationNumber } = req.body;
  let logo = '';
  let banner = '';

  // Check if seller already has a store
  const existingStore = await Store.findOne({ owner: req.user._id });
  if (existingStore) {
    return res.status(400).json({
      success: false,
      error: 'Seller already has a store'
    });
  }

  // Upload logo if provided
  if (req.files && req.files.logo) {
    const result = await cloudinary.uploader.upload(req.files.logo[0].path, {
      folder: 'stores/logos'
    });
    logo = result.secure_url;
  }

  // Upload banner if provided
  if (req.files && req.files.banner) {
    const result = await cloudinary.uploader.upload(req.files.banner[0].path, {
      folder: 'stores/banners'
    });
    banner = result.secure_url;
  }

  const store = await Store.create({
    owner: req.user._id,
    name,
    description,
    logo,
    banner,
    category,
    address,
    businessRegistrationNumber
  });

  res.status(201).json({
    success: true,
    data: store
  });
});

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
exports.getStores = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i'
        }
      }
    : {};

  const count = await Store.countDocuments({ ...keyword });
  const stores = await Store.find({ ...keyword })
    .populate('owner', 'name email')
    .select('name description logo banner rating followers')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort('-createdAt');

  // Takipçi sayılarını hesapla ve banner URL'lerini ekle
  const storesWithStats = stores.map(store => ({
    ...store.toObject(),
    followers: store.followers ? store.followers.length : 0,
    banner: store.banner || 'https://via.placeholder.com/1200x300'
  }));

  res.json({
    success: true,
    data: storesWithStats,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
exports.getStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id)
    .populate('owner', 'name email');

  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Store not found'
    });
  }

  // Get total products count
  const productsCount = await Product.countDocuments({ store: store._id });

  // Get followers count
  const followersCount = store.followers.length;

  // Check if current user follows the store
  let isFollowing = false;
  if (req.user) {
    isFollowing = store.followers.includes(req.user._id);
  }

  // Create response object with additional data
  const storeData = {
    ...store.toObject(),
    totalProducts: productsCount,
    followers: followersCount,
    isFollowing
  };

  res.json({
    success: true,
    data: storeData
  });
});

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private/Seller
exports.updateStore = asyncHandler(async (req, res) => {
  const { name, description, category, address } = req.body;
  let logo = '';
  let banner = '';

  const store = await Store.findById(req.params.id);

  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Store not found'
    });
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this store'
    });
  }

  // Upload new logo if provided
  if (req.files && req.files.logo) {
    const result = await cloudinary.uploader.upload(req.files.logo[0].path, {
      folder: 'stores/logos'
    });
    logo = result.secure_url;
  }

  // Upload new banner if provided
  if (req.files && req.files.banner) {
    const result = await cloudinary.uploader.upload(req.files.banner[0].path, {
      folder: 'stores/banners'
    });
    banner = result.secure_url;
  }

  store.name = name || store.name;
  store.description = description || store.description;
  store.category = category || store.category;
  store.address = address || store.address;
  if (logo) store.logo = logo;
  if (banner) store.banner = banner;

  const updatedStore = await store.save();

  res.json({
    success: true,
    data: updatedStore
  });
});

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private/Seller
exports.deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Store not found'
    });
  }

  // Check ownership
  if (store.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this store'
    });
  }

  await store.remove();

  res.json({
    success: true,
    message: 'Store removed'
  });
});

// @desc    Follow/Unfollow store
// @route   POST /api/stores/:id/follow
// @access  Private/Client
exports.followStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Store not found'
    });
  }

  const isFollowing = store.followers.includes(req.user._id);
  
  if (isFollowing) {
    // Unfollow: Remove user from followers
    store.followers = store.followers.filter(
      (followerId) => followerId.toString() !== req.user._id.toString()
    );
  } else {
    // Follow: Add user to followers
    store.followers.push(req.user._id);
  }

  await store.save();

  res.json({
    success: true,
    isFollowing: !isFollowing,
    message: isFollowing ? 'Store unfollowed successfully' : 'Store followed successfully'
  });
});

// @desc    Get store products
// @route   GET /api/stores/:id/products
// @access  Public
exports.getStoreProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const { sortBy, category, minPrice, maxPrice, minRating, inStock, search } = req.query;

  let query = { store: req.params.id };

  // Fiyat filtresi
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Kategori filtresi
  if (category) {
    query.$or = [
      { categories: category },
      { subcategories: category }
    ];
  }

  // Puan filtresi
  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  // Stok filtresi
  if (inStock === 'true') {
    query.countInStock = { $gt: 0 };
  }

  // Arama filtresi
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Sıralama seçenekleri
  let sortOptions = {};
  switch (sortBy) {
    case 'priceLow':
      sortOptions.price = 1;
      break;
    case 'priceHigh':
      sortOptions.price = -1;
      break;
    case 'newest':
      sortOptions.createdAt = -1;
      break;
    case 'popular':
    default:
      sortOptions.rating = -1;
      sortOptions.numReviews = -1;
      break;
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOptions)
    .populate('categories', 'name')
    .populate('subcategories', 'name')
    .populate('brand', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
}); 