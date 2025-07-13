const Auction = require('../models/Auction');

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

// @GET /api/auctions - Get all auctions with filters + pagination
exports.getAuctions = async (req, res) => {
  try {
    const {
      name,
      category,
      status,
      minPrice,
      maxPrice,
      page = 1,
      limit = 8
    } = req.query;

    const filter = {};

    if (name) {
      filter.title = { $regex: name, $options: 'i' };
    }
    if (category) {
  filter.category = { $regex: category, $options: 'i' }; // ✅ case-insensitive
}

    if (status) filter.status = status;

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (!isNaN(minPrice)) priceFilter.$gte = parseFloat(minPrice);
      if (!isNaN(maxPrice)) priceFilter.$lte = parseFloat(maxPrice);
      if (Object.keys(priceFilter).length > 0) {
        filter.currentBid = priceFilter;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, auctions] = await Promise.all([
      Auction.countDocuments(filter),
      Auction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('seller', 'name')
        .populate('bids.bidder', 'name'),
    ]);

    // ✅ This is the correct format your frontend expects:
    res.status(200).json({ auctions, total });

  } catch (err) {
    console.error('❌ Error fetching auctions:', err);
    res.status(500).json({ message: 'Failed to get auctions', error: err.message });
  }
};

// @GET /api/auctions/:id - Get single auction by ID
exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name')
      .populate('bids.bidder', 'name');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch auction', error: err.message });
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
