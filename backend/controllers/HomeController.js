const asyncHandler = require('../middleware/async');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const userActivityService = require('../services/userActivityService');
const ErrorResponse = require('../utils/errorResponse');
const Order = require('../models/Order');

// Geçerli aktivite tipleri
const validActivityTypes = ['view_product', 'view_category', 'view_brand', 'search', 'add_to_cart', 'purchase'];

// @desc    Get all home page data
// @route   GET /api/home
// @access  Private
exports.getHomeData = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  let personalizedData = {};

  console.log('=== Home Data Request ===');
  console.log('User ID:', userId);
  console.log('Authorization:', req.headers.authorization ? 'Present' : 'Not Present');

  try {
    // Kullanıcı giriş yapmışsa kişiselleştirilmiş verileri getir
    if (userId) {
      console.log('Getting personalized data for user:', userId);
      personalizedData = await userActivityService.getPersonalizedRecommendations(userId);
      console.log('Personalized data retrieved:', {
        recentlyViewedCount: personalizedData.recentlyViewed?.length || 0,
        recommendedCount: personalizedData.recommended?.length || 0,
        similarCount: personalizedData.similarProducts?.length || 0
      });
    }

    // Ana kategorileri getir
    console.log('Fetching main categories');
    const mainCategories = await Category.find({ parent: null })
      .select('name image description');
    console.log('Main categories count:', mainCategories.length);

    // Alt kategorileri getir
    console.log('Fetching sub categories');
    const subCategories = await Category.find({ parent: { $ne: null } })
      .select('name image description parent')
      .populate('parent', 'name');
    console.log('Sub categories count:', subCategories.length);

    // Özel mağazaları getir
    console.log('Fetching special stores');
    const specialStores = await Store.find({ isSponsored: true })
      .select('name logo banner rating followers')
      .limit(10);
    console.log('Special stores count:', specialStores.length);

    // Özel ürünleri getir
    console.log('Fetching special products');
    const specialProducts = await Product.find({ isSponsored: true })
      .select('name price discountPrice images rating numReviews store brand')
      .populate('store', 'name')
      .populate('brand', 'name')
      .limit(10);
    console.log('Special products count:', specialProducts.length);

    // İndirimli ürünleri getir
    console.log('Fetching discounted products');
    const discountedProducts = await Product.find({
      discountPrice: { $exists: true, $ne: null },
      status: 'approved'
    })
      .select('name price discountPrice images rating numReviews store brand')
      .populate('store', 'name')
      .populate('brand', 'name')
      .limit(10);
    console.log('Discounted products count:', discountedProducts.length);

    // En çok satan mağazaları getir
    console.log('Fetching most sold stores');
    const mostSoldStores = await Store.find({ status: 'active' })
      .sort({ rating: -1, 'followers.length': -1 })
      .select('name logo banner rating followers')
      .limit(10);
    console.log('Most sold stores count:', mostSoldStores.length);

    // En çok satan ürünleri getir
    console.log('Fetching most sold products');
    const mostSoldProducts = await Product.find({ status: 'approved' })
      .sort({ rating: -1, numReviews: -1 })
      .select('name price discountPrice images rating numReviews store brand')
      .populate('store', 'name')
      .populate('brand', 'name')
      .limit(10);
    console.log('Most sold products count:', mostSoldProducts.length);

    // Markaları getir
    console.log('Fetching brands');
    const brands = await Brand.find()
      .select('name logo description')
      .limit(10);
    console.log('Brands count:', brands.length);

    // Tüm verileri birleştir ve gönder
    res.status(200).json({
      success: true,
      data: {
        personalized: personalizedData,
        categories: {
          main: mainCategories,
          sub: subCategories
        },
      specialStores,
      specialProducts,
      discountedProducts,
      mostSoldStores,
      mostSoldProducts,
      brands
      }
    });
  } catch (error) {
    console.error('Error in getHomeData:', error);
    return next(new ErrorResponse('Error fetching home data', 500));
  }
});

// @desc    Track user activity
// @route   POST /api/home/track
// @access  Private
exports.trackActivity = asyncHandler(async (req, res, next) => {
  const { type, itemId } = req.body;
  const userId = req.user._id;

  console.log('=== Track Activity Request ===');
  console.log('User ID:', userId);
  console.log('Activity Type:', type);
  console.log('Item ID:', itemId);

  if (!validActivityTypes.includes(type)) {
    console.log('Invalid activity type:', type);
    return next(new ErrorResponse('Invalid activity type', 400));
  }

  try {
    switch (type) {
      case 'view_product':
        await userActivityService.trackProductView(userId, itemId);
        break;
      case 'view_category':
        await userActivityService.trackCategoryView(userId, itemId);
        break;
      case 'view_brand':
        await userActivityService.trackBrandView(userId, itemId);
        break;
      case 'search':
        await userActivityService.trackSearch(userId, itemId);
        break;
      case 'add_to_cart':
        await userActivityService.trackAddToCart(userId, itemId);
        break;
      case 'purchase':
        await userActivityService.trackPurchase(userId, itemId);
        break;
    }

    console.log('Activity tracked successfully');
    console.log('=== End Track Activity ===');

    res.status(200).json({
      success: true,
      message: 'Activity tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    return next(new ErrorResponse('Error tracking activity', 500));
  }
});

// @desc    Get user activity summary
// @route   GET /api/home/activity-summary
// @access  Private
exports.getActivitySummary = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  console.log('=== Activity Summary Request ===');
  console.log('User ID:', userId);

  try {
    const summary = await userActivityService.getActivitySummary(userId);
    console.log('Activity summary retrieved:', summary);
    console.log('=== End Activity Summary ===');

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting activity summary:', error);
    return next(new ErrorResponse('Error getting activity summary', 500));
  }
});

// @desc    Update user preferences
// @route   PUT /api/home/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const preferences = req.body;

  console.log('=== Update Preferences Request ===');
  console.log('User ID:', userId);
  console.log('New preferences:', preferences);

  try {
    const updatedPreferences = await userActivityService.updatePreferences(userId, preferences);
    console.log('Preferences updated:', updatedPreferences);
    console.log('=== End Update Preferences ===');

    res.status(200).json({
      success: true,
      data: updatedPreferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return next(new ErrorResponse('Error updating preferences', 500));
  }
});

// @desc    Get categories with subcategories
// @route   GET /api/v1/home/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  console.log('=== Get Categories Request ===');
  
  try {
    const categories = await Category.find({ parent: null })
      .select('name image subCategories')
      .populate('subCategories', 'name image');
    
    console.log('Categories retrieved:', categories.length);
    console.log('=== End Get Categories ===');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return next(new ErrorResponse('Error getting categories', 500));
  }
});

// @desc    Get special stores
// @route   GET /api/v1/home/special-stores
// @access  Public
exports.getSpecialStores = asyncHandler(async (req, res, next) => {
  console.log('=== Get Special Stores Request ===');
  
  try {
    const stores = await Store.find({ isSponsored: true })
      .select('name logo banner followers rating')
      .limit(10);
    
    console.log('Special stores retrieved:', stores.length);
    console.log('=== End Get Special Stores ===');

    res.status(200).json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('Error getting special stores:', error);
    return next(new ErrorResponse('Error getting special stores', 500));
  }
});

// @desc    Get special products
// @route   GET /api/v1/home/special-products
// @access  Public
exports.getSpecialProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ isSponsored: true })
    .populate('store', 'name')
    .populate('brand', 'name');

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Get discounted products
// @route   GET /api/v1/home/discounted-products
// @access  Public
exports.getDiscountedProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    discountPrice: { $exists: true, $ne: null }
  })
    .populate('store', 'name')
    .populate('brand', 'name')
    .sort({ discountPrice: 1 });

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Get most sold stores
// @route   GET /api/v1/home/most-sold-stores
// @access  Public
exports.getMostSoldStores = asyncHandler(async (req, res, next) => {
  const stores = await Store.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'store',
        as: 'orders'
      }
    },
    {
      $addFields: {
        orderCount: { $size: '$orders' }
      }
    },
    {
      $sort: { orderCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.status(200).json({
    success: true,
    data: stores
  });
});

// @desc    Get most sold products
// @route   GET /api/v1/home/most-sold-products
// @access  Public
exports.getMostSoldProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'products.product',
        as: 'orders'
      }
    },
    {
      $lookup: {
        from: 'stores',
        localField: 'store',
        foreignField: '_id',
        as: 'store'
      }
    },
    {
      $lookup: {
        from: 'brands',
        localField: 'brand',
        foreignField: '_id',
        as: 'brand'
      }
    },
    {
      $addFields: {
        orderCount: { $size: '$orders' },
        store: { $arrayElemAt: ['$store', 0] },
        brand: { $arrayElemAt: ['$brand', 0] }
      }
    },
    {
      $project: {
        name: 1,
        price: 1,
        discountPrice: 1,
        images: 1,
        rating: 1,
        numReviews: 1,
        orderCount: 1,
        'store.name': 1,
        'brand.name': 1
      }
    },
    { $sort: { orderCount: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Get brands
// @route   GET /api/v1/home/brands
// @access  Public
exports.getBrands = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find();

  res.status(200).json({
    success: true,
    data: brands
  });
});

// @desc    Get category products
// @route   GET /api/home/categories/:categoryId/products
// @access  Public
exports.getCategoryProducts = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const { 
    sortBy = 'popular',
    minPrice,
    maxPrice,
    minRating,
    inStock,
    search
  } = req.query;

  console.log('Searching products for category:', categoryId);

  let query = { 
    $or: [
      { categories: categoryId },
      { subcategories: categoryId }
    ]
  };

  // Fiyat filtresi
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
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
    query.$and = [{
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }];
  }

  console.log('Final query:', JSON.stringify(query, null, 2));

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

  const products = await Product.find(query)
    .sort(sortOptions)
    .populate('store', 'name')
    .populate('brand', 'name')
    .populate('categories', 'name image description')
    .populate('subcategories', 'name image description');

  console.log('=== Detailed Product Debug ===');
  console.log('Raw Product Data:', JSON.stringify(products[0], null, 2));
  console.log('Populated Fields Check:');
  if (products.length > 0) {
    const sampleProduct = products[0];
    console.log('Store:', sampleProduct.store);
    console.log('Brand:', sampleProduct.brand);
    console.log('Categories:', sampleProduct.categories);
    console.log('Subcategories Raw:', JSON.stringify(sampleProduct.subcategories, null, 2));
    
    // Alt kategori resimlerini kontrol et
    console.log('=== Subcategory Image Check ===');
    sampleProduct.subcategories.forEach(sub => {
      console.log(`Subcategory ${sub.name}:`, {
        id: sub._id,
        hasImage: !!sub.image,
        imageUrl: sub.image || 'No image'
      });
    });
  }
  console.log('=== End Detailed Product Debug ===');

  console.log('Products with subcategories:', products.map(p => ({
    id: p._id,
    name: p.name,
    subcategories: p.subcategories?.map(sub => ({
      id: sub._id,
      name: sub.name,
      hasImage: !!sub.image,
      imageUrl: sub.image,
      description: sub.description
    }))
  })));

  console.log(`Found ${products.length} products with detailed subcategory info`);
  console.log('=== Query Debug Info ===');
  console.log('Category ID:', categoryId);
  console.log('Sort Options:', sortOptions);
  console.log('Query Filters:', query);
  console.log('=== End Query Debug Info ===');

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Search products
// @route   GET /api/home/search/products
// @access  Public
exports.searchProducts = asyncHandler(async (req, res, next) => {
  console.log('=== Search Products Request ===');
  const { 
    search,
    category,
    brands,
    tags,
    subcategories,
    sortBy = 'newest',
    minPrice,
    maxPrice,
    rating,
    inStock,
    limit = 20,
    skip = 0
  } = req.query;

  console.log('Search Parameters:', {
    search,
    category,
    brands,
    tags,
    subcategories,
    sortBy,
    minPrice,
    maxPrice,
    rating,
    inStock,
    limit,
    skip
  });

  // Ana sorgu oluştur
  let query = { status: 'approved' };

  // Arama filtresi - geliştirilmiş arama mantığı
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { 'brand.name': searchRegex },
      { 'categories.name': searchRegex },
      { 'subcategories.name': searchRegex },
      { 'tags.name': searchRegex }
    ];
  }

  // Kategori filtresi
  if (category) {
    query.categories = category;
  }

  // Alt kategori filtresi
  if (subcategories && subcategories.length > 0) {
    const subcatIds = Array.isArray(subcategories) ? subcategories : [subcategories];
    query.subcategories = { $in: subcatIds };
  }

  // Marka filtresi
  if (brands && brands.length > 0) {
    const brandIds = Array.isArray(brands) ? brands : [brands];
    query.brand = { $in: brandIds };
  }

  // Etiket filtresi
  if (tags && tags.length > 0) {
    const tagIds = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagIds };
  }

  // Fiyat filtresi
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Puan filtresi
  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  // Stok filtresi
  if (inStock === 'true') {
    query.countInStock = { $gt: 0 };
  }

  console.log('Final Query:', JSON.stringify(query, null, 2));

  // Sıralama seçenekleri
  let sortOptions = {};
  switch (sortBy) {
    case 'priceAsc':
      sortOptions.price = 1;
      break;
    case 'priceDesc':
      sortOptions.price = -1;
      break;
    case 'newest':
      sortOptions.createdAt = -1;
      break;
    case 'rating':
      sortOptions.rating = -1;
      break;
    case 'popular':
      sortOptions.numReviews = -1;
      sortOptions.rating = -1;
      break;
    default:
      sortOptions.createdAt = -1;
  }

  try {
    // Toplam ürün sayısını al
    const total = await Product.countDocuments(query);

    // Ana ürünleri getir
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(Number(skip))
      .limit(Number(limit))
      .select('name price discountPrice images rating numReviews store brand categories subcategories tags countInStock description')
      .populate('store', 'name')
      .populate('brand', 'name')
      .populate('categories', 'name')
      .populate('subcategories', 'name')
      .populate('tags', 'name');

    // Benzer ürünleri bul
    let similarProducts = [];
    if (products.length > 0) {
      const firstProduct = products[0];
      const similarQuery = {
        status: 'approved',
        _id: { $ne: firstProduct._id },
        $or: [
          { categories: { $in: firstProduct.categories } },
          { subcategories: { $in: firstProduct.subcategories } },
          { brand: firstProduct.brand },
          { tags: { $in: firstProduct.tags } }
        ]
      };

      similarProducts = await Product.find(similarQuery)
        .sort({ rating: -1 })
        .limit(10)
        .select('name price discountPrice images rating numReviews store brand')
        .populate('store', 'name')
        .populate('brand', 'name');
    }

    // Kullanıcı giriş yapmışsa arama geçmişini kaydet
    if (req.user && search) {
      await userActivityService.trackSearch(req.user._id, search);
    }

    console.log(`Found ${products.length} products out of ${total} total`);
    console.log(`Found ${similarProducts.length} similar products`);
    console.log('=== End Search Products ===');

    res.status(200).json({
      success: true,
      data: products,
      similarProducts,
      pagination: {
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit),
        hasMore: skip + products.length < total
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    return next(new ErrorResponse('Error searching products', 500));
  }
}); 