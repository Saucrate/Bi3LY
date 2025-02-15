const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Store = require('../models/Store');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../utils/cloudinary');

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Seller
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, quantity } = req.body;
  let images = [];

  // Upload images to cloudinary if any
  if (req.files) {
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'products'
      });
      images.push(result.secure_url);
    }
  }

  // Find seller's store
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Store not found'
    });
  }

  const product = await Product.create({
    store: store._id,
    name,
    description,
    price,
    category,
    quantity,
    images
  });

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
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

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .populate('store', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort('-createdAt');

  res.json({
    success: true,
    data: products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get product details
// @route   GET /api/products/:id
// @access  Public
exports.getProductDetails = asyncHandler(async (req, res) => {
  try {
    console.log('Getting product details for:', req.params.id);

    const productId = new mongoose.Types.ObjectId(req.params.id);
    
    const products = await Product.aggregate([
      {
        $match: { _id: productId }
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
          from: 'categories',
          localField: 'subcategories',
          foreignField: '_id',
          as: 'subcategories'
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
        $lookup: {
          from: 'stores',
          localField: 'store',
          foreignField: '_id',
          as: 'store'
        }
      },
      {
        $lookup: {
          from: 'reviews',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$product', '$$productId'] }
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
              }
            },
            {
              $unwind: '$user'
            }
          ],
          as: 'reviews'
        }
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
          createdAt: 1,
          brand: { $arrayElemAt: ['$brand', 0] },
          store: { $arrayElemAt: ['$store', 0] },
          categories: 1,
          subcategories: 1,
          colors: 1,
          sizes: 1,
          reviews: 1,
          rating: 1,
          numReviews: 1
        }
      }
    ]);

    if (!products.length) {
      console.log('Product not found');
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = products[0];

    console.log('Found product:', {
      id: product._id,
      name: product.name,
      price: product.price,
      colors: product.colors?.length,
      sizes: product.sizes?.length,
      reviews: product.reviews?.length
    });

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('GetProductDetails Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting product details'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Seller
exports.updateProduct = asyncHandler(async (req, res) => {
  try {
    console.log('1. Update request:', {
      params: req.params,
      body: req.body,
      files: req.files
    });

    let product = await Product.findById(req.params.id);
    console.log('2. Found product:', product);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'المنتج غير موجود'
      });
    }

    // Form verilerini al
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      countInStock: Number(req.body.countInStock),
    };

    console.log('3. Initial updateData:', updateData);

    // İndirimli fiyat varsa ekle
    if (req.body.discountPrice) {
      updateData.discountPrice = Number(req.body.discountPrice);
    }

    // Arrays için kontrol ve dönüşüm
    if (req.body['categories[]']) {
      updateData.categories = Array.isArray(req.body['categories[]']) 
        ? req.body['categories[]'] 
        : [req.body['categories[]']];
      console.log('4. Categories:', updateData.categories);
    }

    if (req.body['subcategories[]']) {
      updateData.subcategories = Array.isArray(req.body['subcategories[]'])
        ? req.body['subcategories[]']
        : [req.body['subcategories[]']];
      console.log('5. Subcategories:', updateData.subcategories);
    }

    if (req.body['colors[]']) {
      updateData.colors = Array.isArray(req.body['colors[]'])
        ? req.body['colors[]'].filter(c => c !== 'undefined')
        : [req.body['colors[]']].filter(c => c !== 'undefined');
      console.log('6. Colors:', updateData.colors);
    }

    if (req.body['sizes[]']) {
      updateData.sizes = Array.isArray(req.body['sizes[]'])
        ? req.body['sizes[]'].filter(s => s !== 'undefined')
        : [req.body['sizes[]']].filter(s => s !== 'undefined');
      console.log('7. Sizes:', updateData.sizes);
    }

    if (req.body['tags[]']) {
      const tags = Array.isArray(req.body['tags[]'])
        ? req.body['tags[]']
        : [req.body['tags[]']];
      
      updateData.tags = tags.filter(tag => 
        tag !== undefined && 
        tag !== 'undefined' && 
        tag !== null
      );
      console.log('8. Tags:', updateData.tags);
    }

    // Marka varsa ekle
    if (req.body.brand) {
      updateData.brand = req.body.brand;
      console.log('9. Brand:', updateData.brand);
    }

    // Resimler için özel işlem
    let images = [];
    
    // Mevcut resimleri ekle
    if (req.body['existingImages[]']) {
      const existingImages = Array.isArray(req.body['existingImages[]'])
        ? req.body['existingImages[]']
        : [req.body['existingImages[]']];
      images = [...existingImages];
      console.log('10. Existing images:', images);
    }

    // Yeni resimleri yükle ve ekle
    if (req.files && req.files.length > 0) {
      console.log('11. Processing new files:', req.files);
      const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
      const uploadResults = await Promise.all(uploadPromises);
      const newImages = uploadResults.map(result => result.secure_url);
      images = [...images, ...newImages];
      console.log('12. After upload images:', images);
    }

    // Resim varsa güncelle
    if (images.length > 0) {
      updateData.images = images;
    }

    console.log('13. Final update data:', updateData);

    // MongoDB güncelleme sorgusu
    const updateQuery = { $set: updateData };
    console.log('14. Update query:', JSON.stringify(updateQuery, null, 2));

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      {
        new: true,
        runValidators: true
      }
    ).populate('brand', 'name')
     .populate('categories', 'name')
     .populate('subcategories', 'name')
     .populate('colors', 'name code')
     .populate('sizes', 'name')
     .populate('tags', 'name')
     .populate('store', 'name');

    console.log('15. Updated product:', JSON.stringify(product, null, 2));

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product update error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Seller
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  const store = await Store.findById(product.store);
  if (store.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this product'
    });
  }

  await product.remove();

  res.json({
    success: true,
    message: 'Product removed'
  });
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private/Client
exports.createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({
      success: false,
      error: 'Product already reviewed'
    });
  }

  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment
  };

  product.reviews.push(review);
  product.totalRatings = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added'
  });
});

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
// ... existing code ...

exports.getSimilarProducts = asyncHandler(async (req, res) => {
  try {
    console.log('Getting similar products for:', req.params.id);
    
    // 1. Aşama: Mevcut ürünün kategorilerini al
    const product = await Product.findById(req.params.id)
      .select('categories')
      .lean();

    if (!product?.categories?.length) {
      console.log('No categories found for product');
      return res.json({ success: true, data: [] });
    }

    // 2. Aşama: Aynı kategorilerdeki son eklenen ürünleri getir
    const similarProducts = await Product.find({
      _id: { $ne: new mongoose.Types.ObjectId(req.params.id) },
      categories: { $in: product.categories },
      status: 'approved'
    })
    .select('_id name price discountPrice images')
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

    console.log(`Found ${similarProducts.length} similar products by categories`);

    // Eğer yeterli ürün bulunamadıysa, rastgele ürünler ekle
    if (similarProducts.length < 4) {
      const remainingCount = 4 - similarProducts.length;
      const randomProducts = await Product.find({
        _id: { 
          $ne: new mongoose.Types.ObjectId(req.params.id),
          $nin: similarProducts.map(p => p._id)
        },
        status: 'approved'
      })
      .select('_id name price discountPrice images')
      .sort({ createdAt: -1 })
      .limit(remainingCount)
      .lean();

      console.log(`Added ${randomProducts.length} random products`);
      similarProducts.push(...randomProducts);
    }

    return res.json({
      success: true,
      data: similarProducts
    });

  } catch (error) {
    console.error('GetSimilarProducts Error:', error);
    return res.json({ success: true, data: [] });
  }
});