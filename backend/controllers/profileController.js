const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../utils/cloudinary');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;
  let avatar = '';

  // Upload avatar if provided
  if (req.files && req.files.avatar) {
    const result = await cloudinary.uploader.upload(req.files.avatar[0].path, {
      folder: 'avatars',
      width: 150,
      height: 150,
      crop: 'fill'
    });
    avatar = result.secure_url;
  }

  // Build update object
  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (phone) updateFields.phone = phone;
  if (avatar) updateFields.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateFields,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
}); 