const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get admin statistics
// @route   GET /api/statistics/admin
// @access  Private/Admin
exports.getAdminStatistics = asyncHandler(async (req, res) => {
  // Total counts
  const totalUsers = await User.countDocuments();
  const totalSellers = await User.countDocuments({ role: 'seller' });
  const totalClients = await User.countDocuments({ role: 'client' });
  const totalStores = await Store.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Sales statistics
  const totalSales = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  // Monthly sales for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.product',
        totalQuantity: { $sum: '$products.quantity' },
        totalAmount: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' }
  ]);

  // Top performing stores
  const topStores = await Order.aggregate([
    {
      $group: {
        _id: '$store',
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'stores',
        localField: '_id',
        foreignField: '_id',
        as: 'storeDetails'
      }
    },
    { $unwind: '$storeDetails' }
  ]);

  res.json({
    success: true,
    data: {
      counts: {
        users: totalUsers,
        sellers: totalSellers,
        clients: totalClients,
        stores: totalStores,
        products: totalProducts,
        orders: totalOrders
      },
      sales: {
        total: totalSales[0]?.total || 0,
        monthly: monthlySales
      },
      topProducts,
      topStores
    }
  });
});

// @desc    Get seller statistics
// @route   GET /api/statistics/seller
// @access  Private/Seller
exports.getSellerStatistics = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) {
    return res.status(404).json({
      success: false,
      error: 'Store not found'
    });
  }

  // Total products and orders
  const totalProducts = await Product.countDocuments({ store: store._id });
  const totalOrders = await Order.countDocuments({ store: store._id });

  // Sales statistics
  const totalSales = await Order.aggregate([
    { 
      $match: { 
        store: store._id,
        status: { $ne: 'cancelled' }
      }
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  // Monthly sales
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        store: store._id,
        createdAt: { $gte: sixMonthsAgo },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    { $match: { store: store._id } },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.product',
        totalQuantity: { $sum: '$products.quantity' },
        totalAmount: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' }
  ]);

  // Order status distribution
  const orderStatusStats = await Order.aggregate([
    { $match: { store: store._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      counts: {
        products: totalProducts,
        orders: totalOrders,
        followers: store.followers.length
      },
      sales: {
        total: totalSales[0]?.total || 0,
        monthly: monthlySales
      },
      topProducts,
      orderStatusStats
    }
  });
});

// @desc    Get client statistics
// @route   GET /api/statistics/client
// @access  Private/Client
exports.getClientStatistics = asyncHandler(async (req, res) => {
  // Total orders and spending
  const totalOrders = await Order.countDocuments({ user: req.user._id });
  
  const totalSpending = await Order.aggregate([
    { 
      $match: { 
        user: req.user._id,
        status: { $ne: 'cancelled' }
      }
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  // Monthly spending
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySpending = await Order.aggregate([
    {
      $match: {
        user: req.user._id,
        createdAt: { $gte: sixMonthsAgo },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Favorite stores and products
  const favoriteStores = await Store.find({
    followers: req.user._id
  }).select('name logo banner');

  // Order status distribution
  const orderStatusStats = await Order.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      counts: {
        orders: totalOrders,
        favoriteStores: favoriteStores.length
      },
      spending: {
        total: totalSpending[0]?.total || 0,
        monthly: monthlySpending
      },
      favoriteStores,
      orderStatusStats
    }
  });
}); 