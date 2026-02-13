const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getContent,
  getContentItem,
  createContent,
  updateContent,
  deleteContent,
  uploadFile,
  getContentStats,
  addChapter,
  addSubtopic,
  getChapters,
  getPublishedContentForStudent
} = require('../controllers/content');
const { validateContent, validate } = require('../middleware/validation');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/content/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: function (req, file, cb) {
    // Allow specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|mp4|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.route('/')
  .get(getContent)
  .post(validateContent, validate, createContent);

router.route('/:id')
  .get(getContentItem)
  .put(updateContent)
  .delete(deleteContent);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/stats/overview', getContentStats);
router.post('/chapters', addChapter);
router.post('/subtopics', addSubtopic);
router.get('/chapters/:classId', getChapters);
router.get('/student', getPublishedContentForStudent);

module.exports = router;