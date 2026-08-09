const multer = require('multer');

const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 8);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload a JPEG, PNG, WEBP, or HEIC image.'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
