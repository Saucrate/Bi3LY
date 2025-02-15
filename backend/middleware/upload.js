const multer = require('multer');

// Memory storage kullan (disk yerine)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "images") {
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
    } else {
      cb(null, true);
    }
  }
});

module.exports = upload; 