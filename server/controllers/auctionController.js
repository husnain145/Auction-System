const Auction = require('../models/Auction');
const path = require('path');

// @POST /api/auctions
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

// @GET /api/auctions
exports.getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate('seller', 'name')
      .populate('bids.bidder', 'name email'); // Include bidder info

    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get auctions' });
  }
};

// Get auctions for logged-in seller
exports.getSellerAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user.id })
      .populate('bids.bidder', 'name email');
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch seller auctions' });
  }
};
