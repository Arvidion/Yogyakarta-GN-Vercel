const multer = require('multer');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (IMAGE_TYPES.has(file.mimetype) || DOCUMENT_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(
    new Error(
      'Tipe file tidak didukung. Gunakan gambar (JPG, PNG, WebP, GIF) atau dokumen (PDF, Word, Excel, PowerPoint, TXT).'
    )
  );
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
  fileFilter,
});

module.exports = {
  upload,
  MAX_FILE_SIZE,
  IMAGE_TYPES,
  DOCUMENT_TYPES,
};
