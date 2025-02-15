const User = require('../models/User');
const Store = require('../models/Store');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../utils/cloudinary');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await User.countDocuments();
  const users = await User.find()
    .select('-password')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort('-createdAt');

  res.json({
    success: true,
    data: users,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user.role === 'seller') {
    const store = await Store.findOne({ owner: user._id });
    res.json({
      success: true,
      data: {
        ...user.toObject(),
        store
      }
    });
  } else {
    res.json({
      success: true,
      data: user
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, currentPassword, newPassword } = req.body;
  let profileImage = '';

  const user = await User.findById(req.user._id);

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
  }

  // Upload new profile image if provided
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profiles'
    });
    profileImage = result.secure_url;
  }

  // Verify current password if trying to change password
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phoneNumber = phoneNumber || user.phoneNumber;
  if (profileImage) user.profileImage = profileImage;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      ...updatedUser.toObject(),
      password: undefined
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  if (user.role === 'seller') {
    const store = await Store.findOne({ owner: user._id });
    res.json({
      success: true,
      data: {
        ...user.toObject(),
        store
      }
    });
  } else {
    res.json({
      success: true,
      data: user
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isVerified } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  user.isVerified = isVerified !== undefined ? isVerified : user.isVerified;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      ...updatedUser.toObject(),
      password: undefined
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // If user is a seller, delete their store
  if (user.role === 'seller') {
    await Store.findOneAndDelete({ owner: user._id });
  }

  await user.remove();

  res.json({
    success: true,
    message: 'User removed'
  });
}); 