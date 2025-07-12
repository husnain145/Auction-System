const Auction = require('../models/Auction');
const path = require('path');

// @POST /api/auctions - Create a new auction
exports.createAuction = async (req, res) => {
  try {
    const { title, description, category, startingBid, endTime } = req.body;
    const image = req.file ? req.file.filename : null;

    const auction = new Auction({
      title,
      description,
      category,
      startingBid,
      currentBid: startingBid,
      endTime,
      image,
      seller: req.user._id,
      status: 'live'
    });

    const saved = await auction.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Auction creation failed', error: err.message });
  }
};

// @GET /api/auctions - Get all auctions (with optional filters)
// @GET /api/auctions - Get all auctions (with optional filters)
exports.getAuctions = async (req, res) => {
  try {
    const { name, category, status, minPrice, maxPrice } = req.query;

    const filter = {};

    // Title / Name Filter (case-insensitive partial match)
    if (name) {
      filter.title = { $regex: name, $options: 'i' };
    }

    // Category Filter (case-insensitive partial match)
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Status Filter (live/ended)
    if (status) {
      filter.status = status;
    }

    // Price Range Filter (currentBid between min and max)
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter.currentBid = priceFilter;
    }

    const auctions = await Auction.find(filter)
      .populate('seller', 'name')
      .populate('bids.bidder', 'name email');

    res.json(auctions);
  } catch (err) {
    console.error('❌ Auction fetch failed:', err.message);
    res.status(500).json({ message: 'Failed to get auctions' });
  }
};



// @GET /api/auctions/seller/my-auctions
exports.getSellerAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user.id })
      .populate('bids.bidder', 'name email');

    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch seller auctions', error: err.message });
  }
};
