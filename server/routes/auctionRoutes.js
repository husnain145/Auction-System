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

// ✅ Create auction (any logged-in user: seller or admin)
router.post('/', protect, upload.single('image'), createAuction);

// ✅ Get all auctions (with optional filters via query string)
router.get('/', asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, name, status } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (name) filter.title = { $regex: name, $options: 'i' };
  
  if (minPrice || maxPrice) {
    filter.currentBid = {};
    if (minPrice) filter.currentBid.$gte = Number(minPrice);
    if (maxPrice) filter.currentBid.$lte = Number(maxPrice);
  }

  try {
    const auctions = await Auction.find(filter).populate('bids.bidder', 'name');
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching auctions' });
  }
}));


// ✅ Get logged-in seller's own auctions
router.get('/seller/my-auctions', protect, asyncHandler(getSellerAuctions));

// ✅ Delete auction (admin or seller owner only)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });

  if (req.user.role !== 'admin' && auction.seller.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this auction' });
  }

  await auction.deleteOne();
  res.json({ message: 'Auction deleted successfully' });
}));

// ✅ PUT: Update auction by ID (admin or seller owner)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });

  if (req.user.role !== 'admin' && auction.seller.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this auction' });
  }

  if (auction.status === 'ended') {
    return res.status(400).json({ message: 'Cannot edit ended auction' });
  }

  const { title, category, startingBid, endTime, description } = req.body;

  if (title) auction.title = title;
  if (category) auction.category = category;
  if (endTime) auction.endTime = endTime;
  if (description) auction.description = description;

  if (startingBid) {
    auction.startingBid = startingBid;
    if (auction.bids.length === 0) {
      auction.currentBid = startingBid;
    }
  }

  await auction.save();
  res.json({ message: 'Auction updated successfully', auction });
}));

// ✅ Admin: force end auction
router.put('/:id/end', protect, adminOnly, asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found' });

  auction.status = 'ended';
  await auction.save();

  res.json({ message: 'Auction ended' });
}));

module.exports = router;
