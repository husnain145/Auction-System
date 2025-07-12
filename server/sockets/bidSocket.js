const Auction = require('../models/Auction');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('joinAuction', (auctionId) => {
      socket.join(auctionId);
      console.log(`🧍 User joined auction room: ${auctionId}`);
    });

    socket.on('placeBid', async ({ auctionId, userId, amount }) => {
      try {
        const auction = await Auction.findById(auctionId);

        if (!auction || auction.status !== 'live') {
          return socket.emit('bidError', 'Auction is no longer live.');
        }

        if (amount <= auction.currentBid) {
          return socket.emit('bidError', 'Bid must be higher than current bid.');
        }

        const now = new Date();
        const newEndTime = new Date(now.getTime() + 10 * 3000); // 30 seconds from now

        auction.currentBid = amount;
        auction.bids.push({ bidder: userId, amount });

        // ⏳ Extend auction time to now + 10s
        auction.endTime = newEndTime;

        await auction.save();

        // 🔁 Broadcast bid and new endTime
        io.to(auctionId).emit('newBid', {
          auctionId,
          amount,
          bidder: userId,
          time: new Date(),
          newEndTime: newEndTime
        });

        console.log(`✅ New bid: Rs. ${amount} by ${userId} | End time extended`);
      } catch (error) {
        console.error('❌ Bid error:', error.message);
        socket.emit('bidError', 'Failed to place bid.');
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};
