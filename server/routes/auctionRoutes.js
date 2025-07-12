const express = require('express');
const router = express.Router();
const multer = require('multer');
const asyncHandler = require('express-async-handler');

const {
  createAuction,
  getAuctions,
  getSellerAuctions,
} = require('../controllers/auctionController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const Auction = require('../models/Auction');

// 🖼️ Image Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// 🚀 Routes

// Create auction (any logged-in user: seller or admin)
router.post('/', protect, upload.single('image'), createAuction);

// Get all auctions (public)
router.get('/', getAuctions);

// Get logged-in seller's own auctions
router.get('/seller/my-auctions', protect, asyncHandler(getSellerAuctions));

// Delete auction (admin only)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });

  // ✅ Only allow if admin or seller owns it
  if (req.user.role !== 'admin' && auction.seller.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this auction' });
  }

  await auction.deleteOne();
  res.json({ message: 'Auction deleted successfully' });
}));

// ✅ PUT: Update auction by ID (seller or admin)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });

  // ✅ Check permission
  if (req.user.role !== 'admin' && auction.seller.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this auction' });
  }

  // ❌ Prevent editing ended auctions
  if (auction.status === 'ended') {
    return res.status(400).json({ message: 'Cannot edit ended auction' });
  }

  const { title, category, startingBid, endTime, description } = req.body;

  if (title) auction.title = title;
  if (category) auction.category = category;
  if (endTime) auction.endTime = endTime;
  if (description) auction.description = description;

  // ✅ Special handling for startingBid
  if (startingBid) {
    auction.startingBid = startingBid;

    // ✅ Also update currentBid if NO bids yet
    if (auction.bids.length === 0) {
      auction.currentBid = startingBid;
    }
  }

  await auction.save();
  res.json({ message: 'Auction updated successfully', auction });
}));



// Force-end auction (admin only)
router.put('/:id/end', protect, adminOnly, asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });
  auction.status = 'ended';
  await auction.save();
  res.json({ message: 'Auction ended' });
}));

module.exports = router;
