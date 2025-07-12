const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { Server } = require('socket.io');
const endExpiredAuctions = require('./utils/endExpiredAuctions');

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Later replace with frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auctions', require('./routes/auctionRoutes'));
app.use('/uploads', express.static('uploads'));

// WebSockets
require('./sockets/bidSocket')(io);

// Add this default GET route
app.get('/', (req, res) => {
  res.send('✅ Real-Time Auction API is running...');
});

setInterval(endExpiredAuctions, 10000); // Check every 10 seconds

mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  }))
  .catch(err => console.error(err));
