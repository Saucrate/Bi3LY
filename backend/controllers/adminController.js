const mongoose = require('mongoose');
const User = require('../models/User');
const Request = require('../models/Request');
const Store = require('../models/Store');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');
const cloudinary = require('cloudinary');
const fs = require('fs');

// @desc    Get admin statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
exports.getStatistics = asyncHandler(async (req, res) => {
  try {
    // Toplam kullanıcı sayısı
    const totalUsers = await User.find({ role: 'user' }).count();
    
    // Satıcı istatistikleri
    const totalSellers = await User.find({ role: 'seller' }).count();
    const activeSellers = await User.find({ 
      role: 'seller', 
      isSellerVerified: true 
    }).count();

    // Ürün ve sipariş sayıları
    const totalProducts = await Product.find().count();
    const totalOrders = await Order.find().count();

    // Aylık satış istatistikleri
    const currentMonth = new Date().getMonth() + 1;
    const monthlyOrders = await Order.find({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), currentMonth - 1, 1),
        $lt: new Date(new Date().getFullYear(), currentMonth, 1)
      },
      status: 'completed'
    });

    const monthlySales = monthlyOrders.reduce((total, order) => total + order.totalAmount, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSellers,
        activeSellers,
        totalProducts,
        totalOrders,
        monthlyStats: {
          sales: monthlySales,
          target: 200000 // Örnek hedef
        }
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Private/Admin
exports.getSellers = asyncHandler(async (req, res) => {
  const sellers = await User.find({ role: 'seller' })
    .select('name email phoneNumber isSellerVerified createdAt')
    .sort('-createdAt');

  res.json({
    success: true,
    data: sellers
  });
});

// @desc    Get seller details
// @route   GET /api/admin/sellers/:id
// @access  Private/Admin
exports.getSellerDetails = asyncHandler(async (req, res) => {
  // Seller'ı store ile birlikte al
  const seller = await User.findById(req.params.id)
    .select('-password')
    .populate({
      path: 'store',
      model: 'Store'
    });

  if (!seller) {
    return res.status(404).json({
      success: false,
      error: 'Seller not found'
    });
  }

  const stats = {
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalFollowers: seller.store?.followers?.length || 0,
    orderStats: {
      delivered: 0,
      inProgress: 0,
      pending: 0
    },
    ratings: {
      average: seller.store?.rating || 0,
      total: seller.store?.totalRatings || 0
    }
  };

  if (seller.store) {
    // Promise.all kullanarak paralel sorguları çalıştır
    const [products, orders] = await Promise.all([
      Product.find({ store: seller.store._id })
        .select('name price images status createdAt brand categories subcategories')
        .populate('brand', 'name')
        .populate('categories', 'name')
        .populate('subcategories', 'name')
        .lean()
        .exec(),
      Order.find({ store: seller.store._id })
        .select('totalAmount status createdAt')
        .lean()
        .exec()
    ]);

    // Ürün istatistiklerini güncelle
    stats.totalProducts = products.length;
    stats.totalOrders = orders.length;
    
    // Sipariş istatistikleri
    orders.forEach(order => {
      stats.totalSales += order.totalAmount;
      if (order.status) {
        stats.orderStats[order.status] = (stats.orderStats[order.status] || 0) + 1;
      }
    });

    // Kategori istatistiklerini hesapla
    const categoryStats = {};
    products.forEach(product => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(cat => {
          const catName = cat.name || 'Uncategorized';
          categoryStats[catName] = (categoryStats[catName] || 0) + 1;
        });
      } else {
        categoryStats['Uncategorized'] = (categoryStats['Uncategorized'] || 0) + 1;
      }
    });

    // Top 5 kategoriyi al
    stats.topCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Son eklenen 5 ürünü al ve gerekli bilgileri ekle
    stats.recentProducts = products
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(product => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        status: product.status,
        brand: product.brand?.name,
        categories: product.categories?.map(c => c.name) || [],
        createdAt: product.createdAt
      }));

    // Aylık satışları hesapla
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = orders.filter(order => 
      order.status === 'delivered' && 
      new Date(order.createdAt) >= startOfMonth
    );

    stats.earnings = {
      total: stats.totalSales,
      thisMonth: monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      pending: orders
        .filter(order => order.status === 'pending')
        .reduce((sum, order) => sum + order.totalAmount, 0)
    };
  }

  // Aktif ürünleri de ekleyelim
  const activeProducts = await Product.find({ 
    store: seller.store._id,
    status: 'approved'
  })
  .select('name price images status createdAt brand categories')
  .populate('brand', 'name')
  .populate('categories', 'name')
  .sort('-createdAt')
  .lean();

  res.json({
    success: true,
    data: {
      ...seller.toObject(),
      stats,
      activeProducts // Aktif ürünleri de response'a ekledik
    }
  });
});

// @desc    Update seller status
// @route   PUT /api/admin/sellers/:id/status
// @access  Private/Admin
exports.updateSellerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const seller = await User.findById(req.params.id);
  if (!seller) {
    return res.status(404).json({
      success: false,
      error: 'Seller not found'
    });
  }

  seller.isSellerVerified = status === 'approved';
  await seller.save();

  // Mağaza durumunu da güncelle
  const store = await Store.findOne({ owner: seller._id });
  if (store) {
    store.isApproved = seller.isSellerVerified;
    await store.save();
  }

  res.json({
    success: true,
    data: seller
  });
});

// Kullanıcıları listele
exports.getUsers = asyncHandler(async (req, res) => {
  const { filter } = req.query;
  let query = { role: 'client' };
  
  if (filter) {
    query = {
      ...query,
      $or: [
        { name: { $regex: filter, $options: 'i' } },
        { email: { $regex: filter, $options: 'i' } }
      ]
    };
  }

  const users = await User.find(query).select('-password');

  res.json({
    success: true,
    data: users
  });
});

// Kullanıcı durumunu güncelle
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود'
    });
  }

  user.isBlocked = status === 'blocked';
  user.blockReason = reason;
  await user.save();

  res.json({
    success: true,
    data: user
  });
});

// @desc    Get pending requests
// @route   GET /api/admin/requests
// @access  Private/Admin
exports.getPendingRequests = asyncHandler(async (req, res) => {
  try {
    // Tüm talepleri al
    const requests = await Request
      .find()
      .select('type status description createdAt sender store product')
      .populate('sender', 'name email')
      .populate('store', 'name')
      .populate({
        path: 'product',
        select: 'name price images status description brand categories colors sizes',
        match: { status: 'pending' },
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'categories', select: 'name' },
          { path: 'colors', select: 'name code' },
          { path: 'sizes', select: 'name' }
        ]
      })
      .sort('-createdAt')
      .lean();

    // Pending ürünleri bul (henüz request oluşturulmamış olanlar)
    const existingProductIds = requests
      .filter(req => req.type === 'PRODUCT_APPROVAL')
      .map(req => req.product?._id);

    const pendingProducts = await Product
      .find({ 
        status: 'pending',
        _id: { $nin: existingProductIds }
      })
      .populate('brand', 'name')
      .populate('categories', 'name')
      .populate('colors', 'name code')
      .populate('sizes', 'name')
      .populate('store', 'name owner')
      .lean();

    // Her pending ürün için otomatik request oluştur
    const newRequests = await Promise.all(pendingProducts.map(async (product) => {
      // Store owner kontrolü
      if (!product.store || !product.store.owner) {
        console.warn(`Store or owner not found for product: ${product._id}`);
        return null;
      }

      try {
        const request = await Request.create({
          type: 'PRODUCT_APPROVAL',
          sender: product.store.owner,
          store: product.store._id,
          product: product._id,
          description: `Product approval request for: ${product.name}`,
          status: 'pending',
          target: product._id,
          targetModel: 'Product'
        });

        return {
          _id: request._id,
          type: 'PRODUCT_APPROVAL',
          sender: product.store.owner,
          product: product,
          store: product.store,
          status: 'pending',
          createdAt: request.createdAt,
          description: request.description
        };
      } catch (error) {
        console.error(`Error creating request for product ${product._id}:`, error);
        return null;
      }
    }));

    // Null değerleri filtrele
    const validNewRequests = newRequests.filter(req => req !== null);

    // Talepleri filtrele ve formatla
    const formattedRequests = requests
      .filter(req => {
        if (req.type === 'PRODUCT_APPROVAL') {
          return req.product != null;
        }
        return true;
      })
      .map(req => ({
        _id: req._id,
        type: req.type,
        sender: req.sender,
        product: req.product,
        store: req.store,
        status: req.status,
        createdAt: req.createdAt,
        description: req.description
      }));

    // Tüm requestleri birleştir
    const allRequests = [...formattedRequests, ...validNewRequests];

    // Tarihe göre sırala
    allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      data: allRequests
    });

  } catch (error) {
    console.error('getPendingRequests error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching requests'
    });
  }
});

// Request durumunu güncelle
exports.updateRequestStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Önce request'i bul ve populate et
    const request = await Request.findById(id)
      .populate('store')
      .populate('product')
      .populate('sender');

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Request'i güncelle
    request.status = status;
    if (reason) request.reason = reason;

    // Onaylanmışsa, request tipine göre gerekli işlemleri yap
    if (status === 'approved') {
      const sponsorshipEndDate = request.duration 
        ? new Date(Date.now() + (request.duration * 24 * 60 * 60 * 1000)) 
        : null;

      switch (request.type) {
        case 'STORE_SPONSORSHIP':
          // Store'u bul ve kontrol et
          const storeDoc = await Store.findById(request.store);
          if (!storeDoc) {
            throw new Error('Store not found');
          }
          // Mağaza sponsorluğunu güncelle
          await Store.findByIdAndUpdate(storeDoc._id, {
            isSponsored: true,
            sponsorshipEnd: sponsorshipEndDate,
            sponsorshipAmount: request.amount,
            sponsorshipStartDate: new Date()
          });
          break;

        case 'PRODUCT_SPONSORSHIP':
          // Product'ı bul ve kontrol et
          const productDoc = await Product.findById(request.product);
          if (!productDoc) {
            throw new Error('Product not found');
          }
          // Ürün sponsorluğunu güncelle
          await Product.findByIdAndUpdate(productDoc._id, {
            isSponsored: true,
            sponsorshipEnd: sponsorshipEndDate,
            sponsorshipAmount: request.amount,
            sponsorshipStartDate: new Date(),
            billboard: request.images && request.images[0]
          });
          break;

        case 'BLUE_BADGE':
          // Store ve User'ı bul ve kontrol et
          const verifiedStore = await Store.findById(request.store);
          const verifiedUser = await User.findById(request.sender);
          
          if (!verifiedStore || !verifiedUser) {
            throw new Error('Store or User not found');
          }
          
          // Mavi tık güncelleme
          await Store.findByIdAndUpdate(verifiedStore._id, {
            isVerified: true,
            verifiedAt: new Date()
          });
          
          await User.findByIdAndUpdate(verifiedUser._id, {
            isVerified: true,
            verifiedAt: new Date()
          });
          break;

        case 'PRODUCT_APPROVAL':
          // Product'ı bul ve kontrol et
          const approvedProduct = await Product.findById(request.product);
          if (!approvedProduct) {
            throw new Error('Product not found');
          }
          // Ürün onayı
          await Product.findByIdAndUpdate(approvedProduct._id, {
            status: 'approved',
            approvedAt: new Date()
          });
          break;
      }

      // Request'e onay tarihini ekle
      request.approvedAt = new Date();
    }

    // Request'i kaydet
    await request.save();

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating request'
    });
  }
});

// Admin profilini getir
exports.getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user._id)
    .select('-password')
    .lean();

  if (!admin) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود'
    });
  }

  res.json({
    success: true,
    data: admin
  });
});

// Admin profilini güncelle
exports.updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber } = req.body;

  // Email benzersizliğini kontrol et
  if (email) {
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.user._id } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }
  }

  const admin = await User.findById(req.user._id);
  if (!admin) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود'
    });
  }

  // Profili güncelle
  admin.name = name || admin.name;
  admin.email = email || admin.email;
  admin.phoneNumber = phoneNumber || admin.phoneNumber;

  await admin.save();

  res.json({
    success: true,
    data: admin
  });
});

// Satıcı istatistiklerini getir
exports.getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.params.id;

  // Satıcının varlığını kontrol et
  const seller = await User.findById(sellerId);
  if (!seller) {
    return res.status(404).json({
      success: false,
      error: 'البائع غير موجود'
    });
  }

  // Satıcının tüm verilerini paralel olarak getir
  const [products, orders, followers] = await Promise.all([
    Product.find({ seller: sellerId }),
    Order.find({ seller: sellerId }),
    User.countDocuments({ following: sellerId })
  ]);

  // Sipariş durumlarını hesapla
  const orderStats = {
    delivered: orders.filter(order => order.status === 'delivered').length,
    inProgress: orders.filter(order => order.status === 'inProgress').length,
    pending: orders.filter(order => order.status === 'pending').length
  };

  // Toplam satışları hesapla
  const totalSales = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // Bu ayki satışları hesapla
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyOrders = orders.filter(order => 
    order.status === 'delivered' && 
    new Date(order.createdAt) >= startOfMonth
  );
  const monthlySales = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // En çok satan kategorileri hesapla
  const categoryStats = products.reduce((acc, product) => {
    const categoryName = product.category || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  // Satıcının değerlendirmelerini hesapla
  const ratings = await Order.aggregate([
    { 
      $match: { 
        seller: new mongoose.Types.ObjectId(sellerId),
        rating: { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        total: { $sum: 1 }
      }
    }
  ]).exec();

  const ratingStats = ratings.length > 0 ? ratings[0] : { average: 0, total: 0 };

  res.json({
    success: true,
    data: {
      totalSales,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalFollowers: followers,
      orderStats,
      ratings: {
        average: parseFloat(ratingStats.average?.toFixed(1) || '0'),
        total: ratingStats.total
      },
      earnings: {
        total: totalSales,
        thisMonth: monthlySales,
        pending: orders
          .filter(order => order.status === 'pending')
          .reduce((sum, order) => sum + order.totalAmount, 0)
      },
      topCategories,
      recentProducts: products
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
    }
  });
});

// Kullanıcı detaylarını getir
exports.getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// Kullanıcı istatistiklerini getir
exports.getUserStats = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Kullanıcının varlığını kontrol et
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود'
    });
  }

  // Kullanıcının siparişlerini getir
  const orders = await Order.find({ user: userId });

  // Sipariş istatistiklerini hesapla
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const canceledOrders = orders.filter(order => order.status === 'canceled').length;
  const totalSpent = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // Favori kategorileri hesapla
  const categoryStats = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category]++;
    });
    return acc;
  }, {});

  const favoriteCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  res.json({
    success: true,
    data: {
      totalOrders: orders.length,
      completedOrders,
      canceledOrders,
      totalSpent,
      recentOrders: orders
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5),
      favoriteCategories,
      lastActive: user.lastActive
    }
  });
});

// Admin şifresini güncelle
exports.updateAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await User.findById(req.user._id);
  if (!admin) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود'
    });
  }

  // Mevcut şifreyi kontrol et
  const isMatch = await admin.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: 'كلمة المرور الحالية غير صحيحة'
    });
  }

  // Yeni şifreyi ayarla
  admin.password = newPassword;
  await admin.save();

  res.json({
    success: true,
    message: 'تم تحديث كلمة المرور بنجاح'
  });
});

// Aylık hedefi güncelle
exports.updateMonthlyTarget = asyncHandler(async (req, res) => {
  const { target } = req.body;

  if (!target || target < 0) {
    return res.status(400).json({
      success: false,
      error: 'الرجاء إدخال هدف صحيح'
    });
  }

  // Hedefi bir ayar koleksiyonunda saklayabilirsiniz
  // Şimdilik basit tutuyoruz
  const settings = await Settings.findOneAndUpdate(
    { type: 'monthlyTarget' },
    { value: target },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    data: settings
  });
});

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getCategories = asyncHandler(async (req, res) => {
  try {
    console.log('Getting categories in adminController...');
    
    // Önce basit bir sorgu deneyelim ve adım adım ilerleyelim
    const categories = await Category.find({})
      .select('_id name description image parent subCategories isActive')
      .lean()
      .exec();
    
    console.log('Raw categories found:', categories?.length || 0);

    // Şimdi populate işlemlerini yapalım
    const populatedCategories = await Category.populate(categories, [
      { path: 'parent', select: 'name' },
      { path: 'subCategories', select: 'name' }
    ]);

    console.log('Categories after populate:', populatedCategories?.length || 0);

    res.json({
      success: true,
      data: populatedCategories
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error getting categories'
    });
  }
});

// Kategori ekle
exports.addCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, parent } = req.body;
    let image = '';

    if (req.file) {
      // Buffer'ı base64'e çevir
      const base64Data = req.file.buffer.toString('base64');
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${base64Data}`,
        {
          folder: 'categories'
        }
      );
      
      image = result.secure_url;
    }

    const category = await Category.create({
      name,
      description,
      image,
      parent: parent || null
    });

    if (parent) {
      await Category.findByIdAndUpdate(parent, {
        $push: { subCategories: category._id }
      });
    }

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error in addCategory:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Kategori güncelle
exports.updateCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, parent } = req.body;
    let image;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'الفئة غير موجودة'
      });
    }

    // Yeni resim yüklendiyse
    if (req.file) {
      // Eski resmi cloudinary'den sil
      if (category.image) {
        const publicId = category.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`categories/${publicId}`);
      }

      // Buffer'ı base64'e çevir
      const base64Data = req.file.buffer.toString('base64');
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${base64Data}`,
        {
          folder: 'categories'
        }
      );
      
      image = result.secure_url;
    }

    // Üst kategori değişiyorsa
    if (parent !== undefined && parent !== category.parent?.toString()) {
      // Eski üst kategoriden çıkar
      if (category.parent) {
        await Category.findByIdAndUpdate(category.parent, {
          $pull: { subCategories: category._id }
        });
      }
      
      // Yeni üst kategoriye ekle
      if (parent) {
        await Category.findByIdAndUpdate(parent, {
          $push: { subCategories: category._id }
        });
      }
    }

    category.name = name || category.name;
    category.description = description || category.description;
    if (image) category.image = image;
    category.parent = parent || null;

    await category.save();

    const updatedCategory = await Category.findById(category._id)
      .populate('parent', 'name');

    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error in updateCategory:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Kategori sil
exports.deleteCategory = asyncHandler(async (req, res) => {
  // Önce bu kategoriye bağlı ürün var mı kontrol et
  const productsCount = await Product.countDocuments({ 
    category: req.params.id 
  });

  if (productsCount > 0) {
    return res.status(400).json({
      success: false,
      error: 'لا يمكن حذف الفئة لأنها تحتوي على منتجات'
    });
  }

  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'الفئة غير موجودة'
    });
  }

  res.json({
    success: true,
    message: 'تم حذف الفئة بنجاح'
  });
});

// @desc    Get pending products
// @route   GET /api/admin/products/pending
// @access  Private/Admin
exports.getPendingProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product
      .find({ status: 'pending' })
      .populate('brand')
      .populate('categories')
      .populate('store')
      .exec();
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting pending products:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء تحميل المنتجات المعلقة'
    });
  }
});

// @desc    Ürün onayla
// @route   PUT /api/admin/products/:id/approve
// @access  Private/Admin
exports.approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'المنتج غير موجود'
    });
  }

  product.status = 'approved';
  await product.save();

  res.json({
    success: true,
    message: 'تمت الموافقة على المنتج'
  });
});

// @desc    Ürün reddet
// @route   PUT /api/admin/products/:id/reject
// @access  Private/Admin
exports.rejectProduct = asyncHandler(async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تقديم سبب الرفض'
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'المنتج غير موجود'
      });
    }

    // Ürün durumunu güncelle
    await Product.findByIdAndUpdate(product._id, {
      status: 'rejected',
      rejectionReason: reason
    }, { new: true });

    // Satıcıya bildirim gönder
    // TODO: Implement notification system

    res.json({
      success: true,
      message: 'تم رفض المنتج بنجاح'
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء رفض المنتج'
    });
  }
}); 