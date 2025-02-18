const asyncHandler = require('../middleware/async');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Store = require('../models/Store');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod, bankilyNumber } = req.body;

  // Get user's cart with product details
  const cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name price discountPrice store',
      populate: { path: 'store', select: 'name' }
    });

  if (!cart || !cart.items || cart.items.length === 0) {
    return next(new ErrorResponse('Cart is empty', 400));
  }

  // Calculate total and prepare order items
  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    store: item.product.store._id,
    quantity: item.quantity,
    price: item.product.discountPrice || item.product.price
  }));

  const totalAmount = orderItems.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    bankilyNumber,
    totalAmount,
    status: 'pending'
  });

  // Clear the cart after successful order creation
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } }
  );

  // Populate order details for response
  await order.populate([
    { path: 'items.product', select: 'name images price discountPrice' },
    { path: 'items.store', select: 'name' },
    { path: 'user', select: 'name email' }
  ]);

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate([
      {
        path: 'items.product',
        select: 'name price discountPrice images'
      },
      {
        path: 'user',
        select: 'name email phone'
      }
    ])
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: orders
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate([
      {
        path: 'items.product',
        select: 'name price discountPrice images'
      },
      {
        path: 'user',
        select: 'name email phone'
      }
    ]);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check if the order belongs to the user
  if (order.user._id.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  order.status = status;
  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check if the order belongs to the user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to cancel this order', 401));
  }

  // Only allow cancellation of pending orders
  if (order.status !== 'pending') {
    return next(new ErrorResponse('Order cannot be cancelled at this stage', 400));
  }

  order.status = 'cancelled';
  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
}); 