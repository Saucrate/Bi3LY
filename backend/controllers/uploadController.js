import cloudinary from '../config/cloudinaryConfig.js';
// Dosya yükleme
export const uploadFile = async (req, res) => {
  try {
    const file = req.files.image; // 'image' form alanı ile gönderilen dosya
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'bi3ly', // Cloudinary'de dosyaların yükleneceği klasör
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
}; 