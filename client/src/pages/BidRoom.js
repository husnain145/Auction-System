import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const socket = io('http://localhost:5000');

const BidRoom = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [auction, setAuction] = useState(null);
  const [bid, setBid] = useState('');
  const [messages, setMessages] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auctions');
        const found = res.data.find((a) => a._id === id);
        setAuction(found);

        if (found) {
          socket.emit('joinAuction', id);
          if (found.status === 'ended' && found.bids.length > 0) {
            const lastBid = found.bids[found.bids.length - 1];
            setWinner(lastBid.bidder?.name || 'Unknown');
            setIsEnded(true);
            setTimeLeft('Auction Ended');
          }
        }
      } catch {
        alert('Error fetching auction');
      }
    };
    fetchAuction();
  }, [id]);

  useEffect(() => {
    socket.on('newBid', (data) => {
      setMessages((prev) => [...prev, `💰 New bid: Rs. ${data.amount}`]);
      setAuction((prev) => ({
        ...prev,
        currentBid: data.amount,
        endTime: data.newEndTime || prev.endTime,
      }));
    });

    socket.on('bidError', (msg) => {
      alert('❌ ' + msg);
    });

    return () => {
      socket.off('newBid');
      socket.off('bidError');
    };
  }, []);

  useEffect(() => {
    if (!auction) return;

    const interval = setInterval(() => {
      const end = dayjs(auction.endTime);
      const now = dayjs();

      if (now.isAfter(end)) {
        setIsEnded(true);
        setTimeLeft('Auction Ended');
        clearInterval(interval);

        if (auction.bids?.length > 0) {
          const lastBid = auction.bids[auction.bids.length - 1];
          setWinner(lastBid.bidder?.name || 'Unknown');
        }
      } else {
        const diff = dayjs.duration(end.diff(now));
        setTimeLeft(`${diff.minutes()}m ${diff.seconds()}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  const handleBid = () => {
    if (!bid || isNaN(bid)) return alert('Enter a valid amount');
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    socket.emit('placeBid', {
      auctionId: id,
      userId,
      amount: parseInt(bid),
    });
    setBid('');
  };

  if (!auction)
    return <p className="text-white text-center mt-10">Loading auction...</p>;

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto bg-gray-800 border border-blue-500/20 shadow-xl rounded-2xl p-6">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          🎯 {auction.title}
        </h2>

        {/* Image */}
        <div className="flex justify-center mb-6">
          <img
            src={`http://localhost:5000/uploads/${auction.image}`}
            alt={auction.title}
            className="rounded-lg w-full max-w-md border border-gray-700 shadow-lg"
          />
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg mb-6">
          <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <span className="block text-gray-300">Current Bid</span>
            <span className="text-green-400 font-bold text-2xl">Rs. {auction.currentBid}</span>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <span className="block text-gray-300">Time Left</span>
            <span className="text-yellow-400 font-bold text-2xl">{timeLeft}</span>
          </div>
        </div>

        {/* Bid Input */}
        {!isEnded ? (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="number"
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              placeholder="Enter your bid"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleBid}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              💸 Place Bid
            </button>
          </div>
        ) : (
          <div className="text-center bg-red-700/30 border border-red-600 p-4 rounded-lg mb-6">
            <p className="text-red-300 font-semibold">⛔ Auction has ended.</p>
            {winner && (
              <p className="mt-2 text-green-400 font-bold text-lg">🏆 Winner: {winner}</p>
            )}
          </div>
        )}

        {/* Live Feed */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2 text-blue-300">📢 Live Bidding Feed</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-sm">No live activity yet</div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className="bg-blue-600/20 border border-blue-500/40 text-blue-300 text-sm px-4 py-2 rounded-md shadow-sm animate-fade-in"
                >
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bid History */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2 text-purple-300">📜 Bid History</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {auction.bids.length === 0 ? (
              <div className="text-gray-400 text-sm">No bids yet</div>
            ) : (
              auction.bids.map((b, i) => (
                <div
                  key={i}
                  className="bg-gray-700 border border-gray-600 text-sm rounded-md px-4 py-2 shadow-sm"
                >
                  <p className="text-white font-semibold">
                    🧑 {b.bidder?.name || 'User'} — Rs. {b.amount}
                  </p>
                  <p className="text-gray-400 text-xs">
                    🕒 {new Date(b.time).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidRoom;
