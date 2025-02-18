const Address = require('../models/Address');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all addresses for a user
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    data: addresses
  });
});

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
exports.getAddress = asyncHandler(async (req, res, next) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  res.status(200).json({
    success: true,
    data: address
  });
});

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
exports.createAddress = asyncHandler(async (req, res, next) => {
  req.body.user = req.user._id;

  // Eğer bu ilk adres ise, varsayılan olarak ayarla
  const addressCount = await Address.countDocuments({ user: req.user._id });
  if (addressCount === 0) {
    req.body.isDefault = true;
  }

  const address = await Address.create(req.body);

  res.status(201).json({
    success: true,
    data: address
  });
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = asyncHandler(async (req, res, next) => {
  let address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  address = await Address.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: address
  });
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  await address.remove();

  // Eğer silinen adres varsayılan ise ve başka adresler varsa
  // ilk adresi varsayılan yap
  if (address.isDefault) {
    const remainingAddress = await Address.findOne({ user: req.user._id });
    if (remainingAddress) {
      remainingAddress.isDefault = true;
      await remainingAddress.save();
    }
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Set address as default
// @route   PUT /api/addresses/:id/set-default
// @access  Private
exports.setDefaultAddress = asyncHandler(async (req, res, next) => {
  let address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  // Diğer adreslerin varsayılan durumunu kaldır
  await Address.updateMany(
    { user: req.user._id },
    { isDefault: false }
  );

  // Bu adresi varsayılan yap
  address.isDefault = true;
  await address.save();

  res.status(200).json({
    success: true,
    data: address
  });
}); 