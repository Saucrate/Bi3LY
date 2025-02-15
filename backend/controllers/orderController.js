const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Store = require('../models/Store');
const asyncHandler = require('express-async-handler');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Client
exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No items in cart'
    });
  }

  // Group items by store
  const itemsByStore = {};
  for (const item of cart.items) {
    const product = item.product;
    const store = await Store.findById(product.store);

    if (!itemsByStore[store._id]) {
      itemsByStore[store._id] = {
        store: store._id,
        items: [],
        totalAmount: 0
      };
    }

    // Check stock
    if (product.quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        error: `Not enough stock for ${product.name}`
      });
    }

    // Add item to store group
    itemsByStore[store._id].items.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price
    });
    itemsByStore[store._id].totalAmount += product.price * item.quantity;

    // Update product stock
    product.quantity -= item.quantity;
    await product.save();
  }

  // Create orders for each store
  const orders = [];
  for (const storeId in itemsByStore) {
    const order = await Order.create({
      user: req.user._id,
      store: storeId,
      products: itemsByStore[storeId].items,
      totalAmount: itemsByStore[storeId].totalAmount,
      shippingAddress,
      paymentMethod
    });
    orders.push(order);
  }

  // Clear cart after successful order creation
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(201).json({
    success: true,
    data: orders
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res) => {
  let orders;

  if (req.user.role === 'admin') {
    // Admin can see all orders
    orders = await Order.find()
      .populate('user', 'name email')
      .populate('store', 'name')
      .populate('products.product', 'name price images');
  } else if (req.user.role === 'seller') {
    // Seller can see orders for their store
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    orders = await Order.find({ store: store._id })
      .populate('user', 'name email')
      .populate('products.product', 'name price images');
  } else {
    // Client can see their own orders
    orders = await Order.find({ user: req.user._id })
      .populate('store', 'name')
      .populate('products.product', 'name price images');
  }

  res.json({
    success: true,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('store', 'name')
    .populate('products.product', 'name price images');

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Check authorization
  if (
    req.user.role !== 'admin' &&
    (req.user.role === 'seller' && order.store.owner.toString() !== req.user._id.toString()) &&
    (req.user.role === 'client' && order.user.toString() !== req.user._id.toString())
  ) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to view this order'
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Seller
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Check if seller owns the store
  const store = await Store.findById(order.store);
  if (store.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this order'
    });
  }

  order.status = status;
  await order.save();

  res.json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Check authorization
  if (
    req.user.role !== 'admin' &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to cancel this order'
    });
  }

  // Only allow cancellation if order is pending
  if (order.status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: 'Order cannot be cancelled'
    });
  }

  // Restore product quantities
  for (const item of order.products) {
    const product = await Product.findById(item.product);
    product.quantity += item.quantity;
    await product.save();
  }

  order.status = 'cancelled';
  await order.save();

  res.json({
    success: true,
    data: order
  });
}); 