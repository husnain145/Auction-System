const Auction = require('../models/Auction');

module.exports = (io) => {
  const roomUsers = {}; // track unique users per room

  io.on('connection', (socket) => {
    console.log('🔌 Connected:', socket.id);

    socket.on('joinAuction', (auctionId) => {
      socket.join(auctionId);

      if (!roomUsers[auctionId]) roomUsers[auctionId] = new Set();

      socket.on('identifyUser', (userId) => {
        if (userId) {
          roomUsers[auctionId].add(userId);
          io.to(auctionId).emit('uniqueBidders', roomUsers[auctionId].size);
        }
      });

      const userCount = io.sockets.adapter.rooms.get(auctionId)?.size || 0;
      io.to(auctionId).emit('userCount', userCount);
    });

    socket.on('placeBid', async ({ auctionId, userId, amount }) => {
      try {
        const auction = await Auction.findById(auctionId).populate('bids.bidder', 'name');

        if (!auction || auction.status !== 'live') {
          return socket.emit('bidError', 'Auction is not live.');
        }

        if (amount <= auction.currentBid) {
          return socket.emit('bidError', 'Bid must be higher.');
        }

        const now = new Date();
        const newEndTime = new Date(now.getTime() + 30 * 1000);

        auction.currentBid = amount;
        auction.bids.push({ bidder: userId, amount });
        auction.endTime = newEndTime;
        await auction.save();

        const userName = auction.bids[auction.bids.length - 1].bidder?.name || 'Bidder';

        io.to(auctionId).emit('newBid', {
          auctionId,
          amount,
          bidder: userId,
          bidderName: userName,
          time: new Date(),
          newEndTime
        });

        roomUsers[auctionId]?.add(userId);
        io.to(auctionId).emit('uniqueBidders', roomUsers[auctionId].size);

      } catch (err) {
        console.error('❌ Bid error:', err.message);
        socket.emit('bidError', 'Server error during bid.');
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected:', socket.id);
    });
  });
};
