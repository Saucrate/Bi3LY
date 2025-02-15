const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const VerificationCode = require('../models/VerificationCode');
const cloudinary = require('cloudinary');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email gönderme fonksiyonu
const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'رمز التحقق - Bi3LY',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h2 style="color: #3d4785;">رمز التحقق من البريد الإلكتروني</h2>
        <p>رمز التحقق الخاص بك هو:</p>
        <h1 style="color: #3d4785; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
        <p>سينتهي صلاحية هذا الرمز خلال 10 دقائق.</p>
        <p>إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">هذه رسالة تلقائية، يرجى عدم الرد عليها.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Token süreleri (milisaniye cinsinden)
const TOKEN_EXPIRY = {
  admin: '1d',    // 1 gün
  seller: '7d',   // 7 gün
  client: '30d'   // 30 gün
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  try {
    console.log('Register request body:', req.body);

    const { name, email, password, role, phoneNumber, sellerInfo } = req.body;

    // Gerekli alanların kontrolü
    if (!name || !email || !phoneNumber) {
      res.status(400);
      throw new Error('All fields are required');
    }

    // Email kontrolü
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
    }

    // Yeni kullanıcı oluştur - şifre hash'leme User modelinde yapılacak
    const user = await User.create({
      name,
      email,
      password, // Model pre-save hook'unda hash'lenecek
      role: role || 'client',
      phoneNumber,
      sellerInfo: role === 'seller' ? sellerInfo : undefined
    });

    if (user) {
      // Doğrulama kodu oluştur
      const verificationCode = generateVerificationCode();
      
      // Önceki kodları temizle
      await VerificationCode.deleteMany({ email });

      // Yeni kodu kaydet
      await VerificationCode.create({
        email,
        code: verificationCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 dakika
      });

      // Email gönder
      try {
        await sendVerificationEmail(email, verificationCode);
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'تم التسجيل بنجاح وتم إرسال رمز التحقق'
      });
    } else {
      res.status(400);
      throw new Error('بيانات غير صالحة');
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في عملية التسجيل'
    });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Doğrulama kodunu veritabanından kontrol et
    const savedCode = await VerificationCode.findOne({ 
      email,
      code: verificationCode,
      expiresAt: { $gt: new Date() }
    });

    if (!savedCode) {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق غير صحيح أو منتهي الصلاحية'
      });
    }

    // Kullanıcıyı doğrulanmış olarak işaretle
    const user = await User.findOne({ email });
    if (user) {
      user.isVerified = true;
      await user.save();
    }

    // Kullanılan kodu sil
    await VerificationCode.deleteOne({ _id: savedCode._id });

    res.json({
      success: true,
      message: 'تم التحقق من البريد الإلكتروني بنجاح'
    });
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في عملية التحقق'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    console.log('Found user:', { 
      id: user?._id,
      email: user?.email,
      isVerified: user?.isVerified
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'بيانات الاعتماد غير صالحة'
      });
    }

    // matchPassword metodu User modelinde tanımlı
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'بيانات الاعتماد غير صالحة'
      });
    }

    // Email doğrulaması kontrolü
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        error: 'يرجى التحقق من بريدك الإلكتروني أولاً'
      });
    }

    // Token oluştur
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY[user.role] || '7d' }
    );

    // Kullanıcı bilgilerini gönder
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSellerVerified: user.isSellerVerified,
        phoneNumber: user.phoneNumber,
        store: user.store,
        availableRoles: ['client', user.role].filter((value, index, self) => self.indexOf(value) === index)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في تسجيل الدخول'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود'
    });
  }

  // Generate verification code
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  user.verificationCode = verificationCode;
  user.verificationCodeExpires = verificationCodeExpires;
  await user.save();

  // Send verification email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'إعادة تعيين كلمة المرور - Bi3LY',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h2 style="color: #3d4785;">إعادة تعيين كلمة المرور</h2>
        <p>رمز إعادة تعيين كلمة المرور الخاص بك هو:</p>
        <h1 style="color: #3d4785; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
        <p>سينتهي صلاحية هذا الرمز خلال 10 دقائق.</p>
        <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">هذه رسالة تلقائية، يرجى عدم الرد عليها.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);

  res.json({
    success: true,
    message: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'المستخدم غير موجود'
    });
  }

  if (user.verificationCode !== verificationCode) {
    return res.status(400).json({
      success: false,
      error: 'رمز التحقق غير صحيح'
    });
  }

  if (Date.now() > user.verificationCodeExpires) {
    return res.status(400).json({
      success: false,
      error: 'انتهت صلاحية رمز التحقق'
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'تم إعادة تعيين كلمة المرور بنجاح'
  });
});

// Email doğrulama kodu gönderme
exports.sendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    // Email formatını kontrol et
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال بريد إلكتروني صالح'
      });
    }

    // 6 haneli doğrulama kodu oluştur
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated verification code:', verificationCode);

    // Önceki kodları temizle
    await VerificationCode.deleteMany({ email });

    // Yeni kodu kaydet
    const savedCode = await VerificationCode.create({
      email,
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 dakika
    });

    console.log('Saved verification code:', savedCode);

    // Email gönderme
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'رمز التحقق - Bi3LY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
          <h2 style="color: #3d4785;">رمز التحقق من البريد الإلكتروني</h2>
          <p>رمز التحقق الخاص بك هو:</p>
          <h1 style="color: #3d4785; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
          <p>سينتهي صلاحية هذا الرمز خلال 10 دقائق.</p>
          <p>إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">هذه رسالة تلقائية، يرجى عدم الرد عليها.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);

    res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق'
    });
  } catch (error) {
    console.error('Error in sendVerificationCode:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في إرسال رمز التحقق'
    });
  }
});

// Logout işlemi için yeni endpoint
exports.logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    user.token = undefined;
    await user.save();
  }

  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح'
  });
});

// @desc    Check auth status
// @route   GET /api/auth/check-auth
// @access  Private
exports.checkAuth = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isSellerVerified: user.isSellerVerified
    }
  });
}); 