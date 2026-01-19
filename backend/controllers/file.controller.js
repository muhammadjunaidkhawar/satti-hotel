const { sendResponse } = require('../utils');

const uploadFile = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return sendResponse(res, 'fail', 400, 'No file uploaded. Please provide an image file.');
    }

    // Get the file URL from S3
    const fileUrl = req.file.location;

    return sendResponse(res, 'success', 200, 'File uploaded successfully', {
      fileUrl: fileUrl,
      fileName: req.file.key,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return sendResponse(res, 'fail', 500, 'Error uploading file', null);
  }
};

module.exports = {
  uploadFile,
};
