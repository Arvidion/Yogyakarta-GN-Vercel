const express = require('express');
const { upload } = require('../middleware/upload');
const { uploadFiles, handleUploadError } = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, (req, res, next) => {
  upload.array('files', 10)(req, res, (error) => {
    if (error) return handleUploadError(error, req, res, next);
    return uploadFiles(req, res, next);
  });
});

module.exports = router;
