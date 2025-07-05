const multer = require('multer');
const path = require('path');

// Configure Multer storage (using memory storage for direct S3 upload)
const storage = multer.memoryStorage(); // Keeps file in memory as a Buffer

// File filter to allow only specific image types and PDFs (example)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error(`File upload only supports the following filetypes - ${allowedTypes}`), false);
};

// Initialize Multer upload instance
// Adjust limits as necessary, e.g., 5MB file size limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware function for handling single file upload
// 'fieldName' is the name of the file input field in the form
const handleSingleUpload = (fieldName) => (req, res, next) => {
  const uploader = upload.single(fieldName);
  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File is too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ success: false, error: `Multer error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading (e.g., file type not allowed).
      return res.status(400).json({ success: false, error: err.message });
    }
    // Everything went fine, file is in req.file
    next();
  });
};

// Middleware function for handling multiple file uploads
// 'fieldName' is the name of the file input field, 'maxCount' is the max number of files
const handleMultipleUploads = (fieldName, maxCount) => (req, res, next) => {
  const uploader = upload.array(fieldName, maxCount);
  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'One or more files are too large. Maximum size per file is 5MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, error: `Too many files. Maximum ${maxCount} files allowed for field '${fieldName}'.` });
      }
      return res.status(400).json({ success: false, error: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    // Everything went fine, files are in req.files
    next();
  });
};


module.exports = {
  handleSingleUpload,
  handleMultipleUploads,
  // You could also export 'upload' directly if you want more flexibility in routes:
  // upload // Then in routes: upload.single('myFile'), upload.array('myFiles', 3)
};
