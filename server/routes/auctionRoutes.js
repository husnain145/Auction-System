const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createAuction, getAuctions } = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');

// Image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// Create auction with image upload
router.post('/', protect, upload.single('image'), createAuction);

// Get all auctions
router.get('/', getAuctions);

module.exports = router;
