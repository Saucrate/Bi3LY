const Client = require('../models/Client');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../utils/cloudinary');
const User = require('../models/User');

// @desc    Get client profile
// @route   GET /api/client/profile
// @access  Private
exports.getClientProfile = asyncHandler(async (req, res, next) => {
  let client = await Client.findOne({ user: req.user._id }).populate('user', 'name email phoneNumber');

  if (!client) {
    client = await Client.create({
      user: req.user._id
    });
    client = await Client.findOne({ user: req.user._id }).populate('user', 'name email phoneNumber');
  }

  res.status(200).json({
    success: true,
    data: {
      ...client.toObject(),
      name: client.user.name,
      email: client.user.email,
      phoneNumber: client.user.phoneNumber
    }
  });
});

// @desc    Update client profile
// @route   PUT /api/client/profile
// @access  Private
exports.updateClientProfile = asyncHandler(async (req, res, next) => {
  let client = await Client.findOne({ user: req.user._id });

  if (!client) {
    return next(new ErrorResponse('Client profile not found', 404));
  }

  // Fotoğraf yükleme işlemi
  if (req.file) {
    try {
      console.log('Uploading file:', req.file);
      
      // Buffer'ı base64'e çeviriyoruz
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'avatars',
        width: 150,
        height: 150,
        crop: 'fill',
        resource_type: 'auto'
      });

      console.log('Cloudinary result:', result);

      client.avatar = result.secure_url;
      await client.save();
      
      return res.status(200).json({
        success: true,
        data: {
          avatar: result.secure_url
        }
      });
    } catch (error) {
      console.error('Cloudinary upload error details:', error);
      return next(new ErrorResponse('Avatar yüklenirken hata oluştu: ' + error.message, 500));
    }
  }

  // İsim güncelleme
  if (req.body.name) {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    return res.status(200).json({
      success: true,
      data: {
        name: user.name
      }
    });
  }

  res.status(400).json({
    success: false,
    error: 'No update data provided'
  });
});

// @desc    Get client addresses
// @route   GET /api/client/addresses
// @access  Private
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const client = await Client.findOne({ user: req.user._id });

  if (!client) {
    return next(new ErrorResponse('Client profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: client.addresses
  });
});

// @desc    Add new address
// @route   POST /api/client/addresses
// @access  Private
exports.addAddress = asyncHandler(async (req, res, next) => {
  let client = await Client.findOne({ user: req.user._id });

  if (!client) {
    return next(new ErrorResponse('Client profile not found', 404));
  }

  // Eğer bu ilk adres ise, varsayılan olarak ayarla
  if (client.addresses.length === 0) {
    req.body.isDefault = true;
  }

  client.addresses.push(req.body);
  await client.save();

  res.status(201).json({
    success: true,
    data: client.addresses
  });
});

// @desc    Update address
// @route   PUT /api/client/addresses/:addressId
// @access  Private
exports.updateAddress = asyncHandler(async (req, res, next) => {
  let client = await Client.findOne({ user: req.user._id });

  if (!client) {
    return next(new ErrorResponse('Client profile not found', 404));
  }

  const addressIndex = client.addresses.findIndex(
    addr => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    return next(new ErrorResponse('Address not found', 404));
  }

  client.addresses[addressIndex] = {
    ...client.addresses[addressIndex].toObject(),
    ...req.body
  };

  await client.save();

  res.status(200).json({
    success: true,
    data: client.addresses
  });
});

// @desc    Delete address
// @route   DELETE /api/client/addresses/:addressId
// @access  Private
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  let client = await Client.findOne({ user: req.user._id });

  if (!client) {
    return next(new ErrorResponse('Client profile not found', 404));
  }

  const addressIndex = client.addresses.findIndex(
    addr => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    return next(new ErrorResponse('Address not found', 404));
  }

  // Eğer silinen adres varsayılan ise ve başka adresler varsa
  // ilk adresi varsayılan yap
  const isDefault = client.addresses[addressIndex].isDefault;
  client.addresses.splice(addressIndex, 1);

  if (isDefault && client.addresses.length > 0) {
    client.addresses[0].isDefault = true;
  }

  await client.save();

  res.status(200).json({
    success: true,
    data: client.addresses
  });
});

// @desc    Set default address
// @route   PUT /api/client/addresses/:addressId/set-default
// @access  Private
exports.setDefaultAddress = asyncHandler(async (req, res, next) => {
  let client = await Client.findOne({ user: req.user._id });

  if (!client) {
    return next(new ErrorResponse('Client profile not found', 404));
  }

  const addressIndex = client.addresses.findIndex(
    addr => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    return next(new ErrorResponse('Address not found', 404));
  }

  // Tüm adreslerin varsayılan durumunu kaldır
  client.addresses.forEach(addr => {
    addr.isDefault = false;
  });

  // Seçilen adresi varsayılan yap
  client.addresses[addressIndex].isDefault = true;

  await client.save();

  res.status(200).json({
    success: true,
    data: client.addresses
  });
});

// @desc    Change password
// @route   PUT /api/client/profile/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Şifre doğrulamaları
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorResponse('Lütfen tüm alanları doldurun', 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorResponse('Yeni şifreler eşleşmiyor', 400));
  }

  // Kullanıcıyı bul ve şifreyi kontrol et
  const client = await Client.findOne({ user: req.user._id });
  if (!client) {
    return next(new ErrorResponse('Client profile not found', 404));
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Mevcut şifreyi kontrol et
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Mevcut şifre yanlış', 401));
  }

  // Yeni şifreyi ayarla
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Şifre başarıyla değiştirildi'
  });
}); 