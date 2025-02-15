const asyncHandler = require('../middleware/async');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Size = require('../models/Size');
const Color = require('../models/Color');
const Tag = require('../models/Tag');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Category = require('../models/Category');
const cloudinary = require('../utils/cloudinary');
const Review = require('../models/Review');
const Request = require('../models/Request');

// @desc    Create or update store
// @route   POST /api/seller/store
// @access  Private/Seller
exports.createStore = asyncHandler(async (req, res) => {
  // Önce mevcut mağazayı kontrol et
  let store = await Store.findOne({ owner: req.user.id });

  if (store) {
    // Mağaza varsa güncelle
    store = await Store.findOneAndUpdate(
      { owner: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
  } else {
    // Mağaza yoksa yeni oluştur
    req.body.owner = req.user.id;
    store = await Store.create(req.body);
  }

  res.status(200).json({
    success: true,
    data: store
  });
});

// @desc    Get store statistics
// @route   GET /api/seller/stats
// @access  Private/Seller
exports.getStoreStats = asyncHandler(async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    console.log('Getting stats for store:', store?._id);
    
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Tüm istatistikleri tek sorguda al
    const stats = await Product.aggregate([
      {
        $match: {
          store: store._id
        }
      },
      {
        $group: {
          _id: null,
          productsCount: { $sum: 1 },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    // Sipariş sayısını al
    const ordersCount = await Order.countDocuments({ store: store._id });
    
    // Değerlendirme sayısını al
    const ratingsCount = await Review.countDocuments({ store: store._id });

    const statsData = {
      productsCount: stats[0]?.productsCount || 0,
      ordersCount,
      ratingsCount,
      approvedProducts: stats[0]?.approvedCount || 0,
      pendingProducts: stats[0]?.pendingCount || 0,
      rejectedProducts: stats[0]?.rejectedCount || 0
    };

    console.log('Store stats:', statsData);

    res.json({
      success: true,
      data: statsData
    });

  } catch (error) {
    console.error('GetStoreStats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting store statistics'
    });
  }
});

// @desc    Get store products
// @route   GET /api/seller/products
// @access  Private/Seller
exports.getStoreProducts = asyncHandler(async (req, res) => {
  try {
    console.log('Getting products for user:', req.user._id);
    
    // Store'u bul
    const store = await Store.findOne({ owner: req.user._id });
    console.log('Found store:', store?._id);
    
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Pre-populate middleware'ini devre dışı bırak ve aggregate kullan
    const products = await Product.aggregate([
      {
        $match: {
          store: store._id // MongoDB ObjectId olarak eşleştir
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
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'colors',
          localField: 'colors',
          foreignField: '_id',
          as: 'colors'
        }
      },
      {
        $lookup: {
          from: 'sizes',
          localField: 'sizes',
          foreignField: '_id',
          as: 'sizes'
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          discountPrice: 1,
          countInStock: 1,
          images: 1,
          status: 1,
          rejectionReason: 1,
          createdAt: 1,
          'brand': { $arrayElemAt: ['$brand', 0] },
          'categories': 1,
          'colors': 1,
          'sizes': 1
        }
      }
    ]);

    console.log('Found products count:', products.length);

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('GetStoreProducts Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting store products'
    });
  }
});

// Cloudinary yükleme yardımcı fonksiyonu
const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Buffer'ı stream'e dönüştür
    const bufferStream = require('stream').Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

// @desc    Add new product
// @route   POST /api/seller/products
// @access  Private/Seller
exports.addProduct = asyncHandler(async (req, res) => {
  try {
    console.log('Adding product, received data:', req.body);
    console.log('Files received:', req.files);
    
    // Gerekli alanların kontrolü
    if (!req.body.name || !req.body.price || !req.body.brand) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Store'u bul
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Resim yükleme işlemi
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const base64Data = file.buffer.toString('base64');
          const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${base64Data}`,
            { folder: 'products' }
          );
          imageUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
    }

    // JSON parse işlemleri için güvenli fonksiyon
    const safeJSONParse = (str, defaultValue = []) => {
      try {
        return str ? JSON.parse(str) : defaultValue;
      } catch (e) {
        console.error('JSON parse error:', e);
        return defaultValue;
      }
    };

    // Product verilerini hazırla
    const productData = {
      name: req.body.name,
      description: req.body.description || '',
      price: Number(req.body.price) || 0,
      countInStock: Number(req.body.countInStock) || 0,
      brand: req.body.brand,
      store: store._id,
      images: imageUrls,
      categories: safeJSONParse(req.body.categories),
      subcategories: safeJSONParse(req.body.subcategories),
      colors: safeJSONParse(req.body.colors),
      sizes: safeJSONParse(req.body.sizes),
      tags: safeJSONParse(req.body.tags)
    };

    if (req.body.discountPrice) {
      productData.discountPrice = Number(req.body.discountPrice);
    }

    console.log('Processed product data:', productData);

    // Ürünü oluştur
    const product = await Product.create(productData);

    console.log('Product created:', product);

    res.status(201).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error in addProduct:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update product
// @route   PUT /api/seller/products/:id
// @access  Private/Seller
exports.updateProduct = asyncHandler(async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Files received:', req.files);

    // Store'u bul
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Ürünü bul
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Update data hazırlama
    const updateData = {
      status: 'pending' // Her güncelleme sonrası pending yapıyoruz
    };

    // String alanlar
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.price) updateData.price = Number(req.body.price);
    if (req.body.discountPrice) updateData.discountPrice = Number(req.body.discountPrice);
    if (req.body.countInStock) updateData.countInStock = Number(req.body.countInStock);
    if (req.body.brand) updateData.brand = req.body.brand;

    // Array ve referans alanları
    if (req.body.categories) updateData.categories = req.body.categories;
    if (req.body.subcategories) updateData.subcategories = req.body.subcategories;
    if (req.body.colors) updateData.colors = req.body.colors;
    if (req.body.sizes) updateData.sizes = req.body.sizes;
    if (req.body.tags) updateData.tags = req.body.tags;

    // Resim işlemleri
    let images = [];

    // Mevcut resimleri ekle
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        if (Array.isArray(existingImages)) {
          images = existingImages;
        }
      } catch (error) {
        console.error('Error parsing existingImages:', error);
      }
    }

    // Yeni resimleri yükle
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const base64Data = file.buffer.toString('base64');
          const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${base64Data}`,
            { folder: 'products' }
          );
          images.push(result.secure_url);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
    }

    // Resimler varsa güncelle
    if (images.length > 0) {
      updateData.images = images;
    }

    console.log('Final update data:', updateData);

    // Ürünü güncelle
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: false
      }
    ).populate('brand', 'name')
     .populate('categories', 'name')
     .populate('subcategories', 'name')
     .populate('colors', 'name code')
     .populate('sizes', 'name')
     .populate('store', 'name');

    // Admin için onay isteği oluştur
    await Request.create({
      type: 'PRODUCT_APPROVAL',
      sender: req.user.id,
      store: store._id,
      product: updatedProduct._id,
      description: `Product update approval request for: ${updatedProduct.name}`,
      status: 'pending',
      target: updatedProduct._id,
      targetModel: 'Product'
    });

    res.status(200).json({
      success: true,
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/seller/products/:id
// @access  Private/Seller
exports.deleteProduct = asyncHandler(async (req, res) => {
  try {
    // Store'u bul
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Ürünü bul
    const product = await Product.findOne({
      _id: req.params.id,
      store: store._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Ürünün resimlerini Cloudinary'den sil
    if (product.images && product.images.length > 0) {
      try {
        const deletePromises = product.images.map(imageUrl => {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          return cloudinary.uploader.destroy(`products/${publicId}`);
        });
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
      }
    }

    // Ürünü sil (yeni metod kullanımı)
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting product'
    });
  }
});

// @desc    Get store profile
// @route   GET /api/seller/profile
// @access  Private/Seller
exports.getStoreProfile = asyncHandler(async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id })
      .populate('owner', 'name email phoneNumber')
      .populate('followers', 'name avatar');

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Store bilgilerine user bilgilerini ekle
    const storeData = store.toObject();
    storeData.contactPhone = store.owner.phoneNumber;
    storeData.contactEmail = store.owner.email;

    const stats = {
      totalOrders: await Order.countDocuments({ store: store._id }),
      activeProducts: await Product.countDocuments({ 
        store: store._id, 
        status: 'approved' 
      }),
      totalFollowers: store.followers.length
    };

    res.json({
      success: true,
      data: {
        store: storeData,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching store profile'
    });
  }
});

// @desc    Update store profile
// @route   PUT /api/seller/profile
// @access  Private/Seller
exports.updateStoreProfile = asyncHandler(async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    const user = await User.findById(req.user._id);
    
    if (!store || !user) {
      return res.status(404).json({
        success: false,
        error: 'Store or user not found'
      });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      location: req.body.location,
      contactPhone: user.phoneNumber,
      contactEmail: user.email
    };

    if (req.body.socialMedia) {
      updateData.socialMedia = JSON.parse(req.body.socialMedia);
    }
    
    if (req.body.businessHours) {
      updateData.businessHours = JSON.parse(req.body.businessHours);
    }

    // Logo ve banner yükleme
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        try {
          const logoUrl = await uploadToCloudinary(
            req.files.logo[0].buffer,
            'stores/logos'
          );
          updateData.logo = logoUrl;
        } catch (error) {
          console.error('Logo upload error:', error);
        }
      }
      
      if (req.files.banner && req.files.banner[0]) {
        try {
          const bannerUrl = await uploadToCloudinary(
            req.files.banner[0].buffer,
            'stores/banners'
          );
          updateData.banner = bannerUrl;
        } catch (error) {
          console.error('Banner upload error:', error);
        }
      }
    }

    const updatedStore = await Store.findByIdAndUpdate(
      store._id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('owner', 'name email phoneNumber');

    res.json({
      success: true,
      data: updatedStore
    });
  } catch (error) {
    console.error('Update store profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating store profile'
    });
  }
});

// @desc    Get store orders
// @route   GET /api/seller/orders
// @access  Private/Seller
exports.getOrders = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user.id });
  const orders = await Order.find({ store: store._id })
    .populate('user', 'name email')
    .populate('products.product');

  res.json({
    success: true,
    data: orders
  });
});

// @desc    Update order status
// @route   PUT /api/seller/orders/:id
// @access  Private/Seller
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user.id });
  const order = await Order.findOne({ _id: req.params.id, store: store._id });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  order.status = req.body.status;
  await order.save();

  res.json({
    success: true,
    data: order
  });
});

// @desc    Get detailed store statistics
// @route   GET /api/seller/detailed-stats
// @access  Private/Seller
exports.getDetailedStats = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user.id });
  
  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Store not found'
    });
  }

  // Son 6 ayın verilerini getir
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Aylık satış verileri - tüm metrikleri içerecek şekilde güncelle
  const monthlyOrders = await Order.aggregate([
    {
      $match: {
        store: store._id,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 },
        rating: { $avg: '$rating' },
        customers: { $addToSet: '$user' },
        favorites: { 
          $sum: {
            $cond: [{ $in: ['$_id', '$favorites'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Her ay için veri olduğundan emin ol
  const allMonths = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth() + 1;
    if (!monthlyOrders.find(m => m._id === month)) {
      monthlyOrders.push({
        _id: month,
        total: 0,
        count: 0,
        rating: 0,
        customers: [],
        favorites: 0
      });
    }
  }

  // Ayları sırala
  monthlyOrders.sort((a, b) => a._id - b._id);

  // En çok satan ürünler
  const topProducts = await Product.find({ store: store._id })
    .sort('-soldCount')
    .limit(4);

  // En iyi müşteriler
  const topCustomers = await Order.aggregate([
    { $match: { store: store._id } },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 4 }
  ]);

  // Müşteri detaylarını getir
  const customerDetails = await User.find(
    { _id: { $in: topCustomers.map(c => c._id) } },
    'name avatar'
  );

  // Son ayın ve önceki ayın verilerini getir
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  // Bu ay ve geçen ayın siparişleri
  const currentMonthOrders = await Order.aggregate([
    {
      $match: {
        store: store._id,
        createdAt: { 
          $gte: firstDayOfMonth,
          $lt: firstDayOfNextMonth
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        customerCount: { $addToSet: '$user' },
        rewardPoints: { $sum: '$rewardPoints' }
      }
    }
  ]);

  const lastMonthOrders = await Order.aggregate([
    {
      $match: {
        store: store._id,
        createdAt: { 
          $gte: firstDayOfLastMonth,
          $lt: firstDayOfMonth
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        customerCount: { $addToSet: '$user' },
        rewardPoints: { $sum: '$rewardPoints' }
      }
    }
  ]);

  // Bekleyen siparişleri say
  const pendingOrdersCount = await Order.countDocuments({
    store: store._id,
    status: 'pending'
  });

  res.json({
    success: true,
    data: {
      basicStats: {
        productsCount: await Product.countDocuments({ store: store._id }),
        customersCount: await Order.distinct('user', { store: store._id }).length,
        followersCount: store.followers.length,
        rating: store.rating || 0,
        soldProductsCount: await Order.countDocuments({ store: store._id }),
        favoritesCount: await Favorite.countDocuments({ 'stores': store._id })
      },
      monthlyStats: monthlyOrders,
      topProducts: topProducts.map(p => ({
        _id: p._id,
        name: p.name,
        image: p.images[0],
        soldCount: p.soldCount
      })),
      topCustomers: customerDetails.map((user, index) => ({
        _id: user._id,
        name: user.name,
        image: user.avatar,
        totalSpent: topCustomers[index].totalSpent,
        orderCount: topCustomers[index].orderCount
      })),
      comparison: {
        currentMonth: {
          sales: currentMonthOrders[0]?.totalSales || 0,
          customers: currentMonthOrders[0]?.customerCount?.length || 0,
          rewards: currentMonthOrders[0]?.rewardPoints || 0
        },
        lastMonth: {
          sales: lastMonthOrders[0]?.totalSales || 0,
          customers: lastMonthOrders[0]?.customerCount?.length || 0,
          rewards: lastMonthOrders[0]?.rewardPoints || 0
        }
      },
      pendingOrders: pendingOrdersCount
    }
  });
});

// @desc    Get all brands
// @route   GET /api/seller/brands
// @access  Private/Seller
exports.getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();
  res.json({
    success: true,
    data: brands
  });
});

// @desc    Add new brand
// @route   POST /api/seller/brands
// @access  Private/Seller
exports.addBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);
  res.status(201).json({
    success: true,
    data: brand
  });
});

// @desc    Get all colors
// @route   GET /api/seller/colors
// @access  Private/Seller
exports.getColors = asyncHandler(async (req, res) => {
  const colors = await Color.find();
  res.json({
    success: true,
    data: colors
  });
});

// @desc    Add new color
// @route   POST /api/seller/colors
// @access  Private/Seller
exports.addColor = asyncHandler(async (req, res) => {
  const color = await Color.create(req.body);
  res.status(201).json({
    success: true,
    data: color
  });
});

// @desc    Get all sizes
// @route   GET /api/seller/sizes
// @access  Private/Seller
exports.getSizes = asyncHandler(async (req, res) => {
  const sizes = await Size.find();
  res.json({
    success: true,
    data: sizes
  });
});

// @desc    Add new size
// @route   POST /api/seller/sizes
// @access  Private/Seller
exports.addSize = asyncHandler(async (req, res) => {
  const size = await Size.create(req.body);
  res.status(201).json({
    success: true,
    data: size
  });
});

// @desc    Get all tags
// @route   GET /api/seller/tags
// @access  Private/Seller
exports.getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find();
  res.json({
    success: true,
    data: tags
  });
});

// @desc    Add new tag
// @route   POST /api/seller/tags
// @access  Private/Seller
exports.addTag = asyncHandler(async (req, res) => {
  const tag = await Tag.create(req.body);
  res.status(201).json({
    success: true,
    data: tag
  });
});

// @desc    Get categories
// @route   GET /api/seller/categories
// @access  Private/Seller
exports.getCategories = asyncHandler(async (req, res) => {
  try {
    // Tüm kategorileri getir ve populate et
    const categories = await Category.find()
      .populate('parent', 'name')
      .populate('subCategories', 'name')
      .lean();

    // Debug için
    console.log('Categories found:', categories.length);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting categories'
    });
  }
});

// @desc    Get single product detail
// @route   GET /api/seller/products/:id
// @access  Private/Seller
exports.getProductDetail = asyncHandler(async (req, res) => {
  try {
    console.log('Getting product details for ID:', req.params.id);
    console.log('User ID:', req.user._id);

    const store = await Store.findOne({ owner: req.user._id });
    console.log('Found store:', store?._id);

    if (!store) {
      console.log('Store not found for user:', req.user._id);
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      store: store._id
    })
    .populate('brand', 'name')
    .populate('categories', 'name')
    .populate('subcategories', 'name')
    .populate('colors', 'name code')
    .populate('sizes', 'name')
    .populate('tags', 'name')
    .populate('store', 'name');

    console.log('Found product:', {
      id: product?._id,
      brand: product?.brand,
      categories: product?.categories,
      subcategories: product?.subcategories,
      colors: product?.colors,
      sizes: product?.sizes,
      tags: product?.tags
    });

    if (!product) {
      console.log('Product not found:', req.params.id);
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting product detail'
    });
  }
}); 