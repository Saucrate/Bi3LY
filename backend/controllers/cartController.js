const asyncHandler = require('../middleware/async');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name price discountPrice images store brand',
      populate: [
        { path: 'store', select: 'name' },
        { path: 'brand', select: 'name' }
      ]
    });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  // Detaylı loglama ekleyelim
  console.log('=== Add to Cart Request ===');
  console.log('User ID:', userId);
  console.log('Product ID:', productId);
  console.log('Quantity:', quantity);

  let cart = await Cart.findOne({ user: userId });
  console.log('Existing cart:', cart ? 'Found' : 'Not found');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    console.log('New cart created');
  }

  const existingItem = cart.items.find(item => 
    item.product.toString() === productId
  );
  console.log('Existing item in cart:', existingItem ? 'Found' : 'Not found');

  if (existingItem) {
    existingItem.quantity += quantity;
    console.log('Updated quantity:', existingItem.quantity);
  } else {
    cart.items.push({ product: productId, quantity });
    console.log('Added new item to cart');
  }

  await cart.save();
  console.log('Cart saved successfully');

  // Populate product details
  await cart.populate('items.product');
  console.log('Cart populated with product details');

  console.log('=== End Add to Cart ===');

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
exports.updateQuantity = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  // Ürünün var olduğunu kontrol et
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Stok kontrolü
  if (product.countInStock < quantity) {
    return next(new ErrorResponse('Insufficient stock', 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  // Güncel sepeti getir
  cart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price discountPrice images store brand',
    populate: [
      { path: 'store', select: 'name' },
      { path: 'brand', select: 'name' }
    ]
  });

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();

  // Güncel sepeti getir
  cart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price discountPrice images store brand',
    populate: [
      { path: 'store', select: 'name' },
      { path: 'brand', select: 'name' }
    ]
  });

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Cart cleared'
  });
});

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
exports.getCartSummary = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'price discountPrice');

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: {
        totalItems: 0,
        subtotal: 0,
        total: 0
      }
    });
  }

  const summary = cart.items.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return {
      totalItems: acc.totalItems + item.quantity,
      subtotal: acc.subtotal + (price * item.quantity)
    };
  }, { totalItems: 0, subtotal: 0 });

  res.status(200).json({
    success: true,
    data: {
      ...summary,
      total: summary.subtotal // Vergi, kargo vb. eklenebilir
    }
  });
}); 