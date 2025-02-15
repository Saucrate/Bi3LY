const Request = require('../models/Request');
const Store = require('../models/Store');
const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// @desc    Create new request
// @route   POST /api/seller/requests
// @access  Private/Seller
exports.createRequest = asyncHandler(async (req, res) => {
  try {
    const { type, store, product, amount, duration, description, images } = req.body;

    // Validation
    if (!type || !store || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Sponsorluk talebi için ek kontroller
    if (type.includes('SPONSORSHIP')) {
      if (!amount || !duration) {
        return res.status(400).json({
          success: false,
          error: 'Amount and duration required for sponsorship'
        });
      }
    }

    // Request oluştur
    const request = await Request.create({
      type,
      sender: req.user.id,
      store,
      product,
      amount,
      duration,
      description,
      images,
      status: 'pending'
    });

    // Populate edip gönder
    const populatedRequest = await Request.findById(request._id)
      .populate('store', 'name logo phone location category')
      .populate('sender', 'name email phone')
      .populate('product', 'name images price');

    res.status(201).json({
      success: true,
      data: populatedRequest
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get seller's requests
// @route   GET /api/seller/requests
// @access  Private/Seller
exports.getSellerRequests = asyncHandler(async (req, res) => {
  try {
    const requests = await Request.find({ sender: req.user.id })
      .populate({
        path: 'store',
        select: 'name logo phone location category isVerified'
      })
      .populate({
        path: 'product',
        select: 'name images price'
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error('Get seller requests error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private/Admin
exports.getRequests = asyncHandler(async (req, res) => {
  // Normal requestleri al (NEW_PRODUCT dışındakileri)
  const normalRequests = await Request.find({ type: { $ne: 'NEW_PRODUCT' } })
    .populate({
      path: 'sender',
      select: 'name email phoneNumber'
    })
    .populate({
      path: 'store',
      select: 'name owner'
    })
    .populate({
      path: 'product',
      select: 'name price images'
    })
    .sort('-createdAt');

  // Pending durumundaki ürünleri detaylı şekilde getir
  const pendingProducts = await Product.find({ status: 'pending' })
    .populate({
      path: 'store',
      select: 'name owner',
      populate: {
        path: 'owner',
        select: 'name email phoneNumber'
      }
    })
    .populate('brand')
    .populate('categories')
    .populate('subcategories')
    .populate('colors')
    .populate('sizes')
    .sort('-createdAt');

  const productRequests = pendingProducts.map(product => ({
    _id: `pending_product_${product._id}`,
    type: 'NEW_PRODUCT',
    status: 'pending',
    sender: product.store.owner,
    store: product.store,
    product: {
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images,
      brand: product.brand,
      categories: product.categories,
      subcategories: product.subcategories,
      colors: product.colors,
      sizes: product.sizes,
      countInStock: product.countInStock
    },
    description: 'طلب مراجعة منتج جديد',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    isPendingProduct: true
  }));

  const allRequests = [...normalRequests, ...productRequests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    data: allRequests
  });
});

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
exports.updateRequestStatus = asyncHandler(async (req, res) => {
  try {
    const { status, reason } = req.body;
    const requestId = req.params.id;

    console.log('Updating request with ID:', requestId); // Debug için

    // Request'i bul
    const request = await Request.findById(requestId);

    if (!request) {
      console.log('Request not found with ID:', requestId); // Debug için
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Request tipine göre işlem yap
    if (status === 'approved') {
      switch (request.type) {
        case 'STORE_SPONSORSHIP':
          if (request.store) {
            const sponsorshipEnd = new Date();
            sponsorshipEnd.setDate(sponsorshipEnd.getDate() + (request.duration || 30));
            
            await Store.findByIdAndUpdate(request.store, {
              isSponsored: true,
              sponsorshipEnd: sponsorshipEnd
            });
          }
          break;

        case 'BLUE_BADGE':
          if (request.store) {
            await Store.findByIdAndUpdate(request.store, {
              isVerified: true
            });
          }
          break;

        case 'PRODUCT_SPONSORSHIP':
          if (request.product) {
            const sponsorshipEnd = new Date();
            sponsorshipEnd.setDate(sponsorshipEnd.getDate() + (request.duration || 30));
            
            await Product.findByIdAndUpdate(request.product, {
              isSponsored: true,
              sponsorshipEnd: sponsorshipEnd
            });
          }
          break;
      }
    }

    // Request'in durumunu güncelle
    request.status = status;
    request.rejectReason = reason;
    await request.save();

    // Güncellenmiş request'i gönder
    const updatedRequest = await Request.findById(requestId)
      .populate('store')
      .populate('product')
      .populate('sender');

    res.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error in updateRequestStatus:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Create sponsorship request
// @route   POST /api/requests/sponsorship
// @access  Private/Seller
exports.createSponsorshipRequest = asyncHandler(async (req, res) => {
  const { type, duration, amount, description } = req.body;

  // Satıcının mağazasını bul
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'المتجر غير موجود'
    });
  }

  const request = await Request.create({
    type,
    sender: req.user._id,
    store: store._id,
    duration,
    amount,
    description
  });

  res.status(201).json({
    success: true,
    data: request
  });
});

// @desc    Create blue badge request
// @route   POST /api/requests/blue-badge
// @access  Private/Seller
exports.createBlueBadgeRequest = asyncHandler(async (req, res) => {
  const { description } = req.body;

  const request = await Request.create({
    type: 'BLUE_BADGE',
    sender: req.user._id,
    description
  });

  res.status(201).json({
    success: true,
    data: request
  });
});

// @desc    Create complaint request
// @route   POST /api/requests/complaint
// @access  Private/Seller,Client
exports.createComplaintRequest = asyncHandler(async (req, res) => {
  const { description } = req.body;
  let images = [];

  try {
    // Resimleri yükle
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        // Buffer'ı base64'e çevir
        const base64Data = file.buffer.toString('base64');
        return cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64Data}`,
          {
            folder: 'complaints'
          }
        );
      });

      const results = await Promise.all(uploadPromises);
      images = results.map(result => result.secure_url);
    }

    const request = await Request.create({
      type: 'USER_COMPLAINT',
      sender: req.user._id,
      description,
      images
    });

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error in createComplaintRequest:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error uploading images'
    });
  }
});

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Private/Admin,Seller
exports.getRequestById = asyncHandler(async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .select('_id type sender store product description amount duration status createdAt updatedAt')
      .populate({
        path: 'store',
        model: 'Store',
        select: 'name logo phone location category isVerified owner'
      })
      .populate({
        path: 'sender',
        model: 'User',
        select: 'name email phone'
      })
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Debug için
    console.log('Raw request:', JSON.stringify(request, null, 2));

    // Request verilerini düzenle
    const enhancedRequest = {
      ...request,
      amount: request.amount || 0,
      duration: request.duration || 0,
      store: request.store || {},
      description: request.description || '',
      status: request.status || 'pending',
      type: request.type || '',
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };

    // Debug için
    console.log('Enhanced request:', JSON.stringify(enhancedRequest, null, 2));

    res.json({
      success: true,
      data: enhancedRequest
    });
  } catch (error) {
    console.error('Get request by id error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}); 