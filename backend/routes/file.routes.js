const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadS3 = require('../middlewares/uploadS3');
const { uploadFile } = require('../controllers/file.controller');
const { sendResponse } = require('../utils');

// Wrapper to handle multer errors
const handleUpload = (req, res, next) => {
  uploadS3.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendResponse(res, 'fail', 400, 'File size too large. Maximum size is 5MB.');
        }
        return sendResponse(res, 'fail', 400, `Upload error: ${err.message}`);
      }
      // Handle file filter errors
      if (err.message === 'Only image files are allowed!') {
        return sendResponse(res, 'fail', 400, 'Only image files are allowed!');
      }
      return sendResponse(res, 'fail', 400, err.message || 'File upload error');
    }
    next();
  });
};

router.post('/', handleUpload, uploadFile);

module.exports = router;
