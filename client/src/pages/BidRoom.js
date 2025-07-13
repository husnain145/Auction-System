import { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import confetti from 'canvas-confetti';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const socket = io('http://localhost:5000');

const BidRoom = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  const [auction, setAuction] = useState(null);
  const [bid, setBid] = useState('');
  const [messages, setMessages] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [uniqueBidders, setUniqueBidders] = useState(0);

  const bidSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auctions/${id}`);
        const found = res.data;
        setAuction(found);

        socket.emit('joinAuction', id);
        socket.emit('identifyUser', userId);

        if (found.status === 'ended' && found.bids.length > 0) {
          const last = found.bids[found.bids.length - 1];
          setWinner(last.bidder?.name || 'Unknown');
          setIsEnded(true);
          setTimeLeft('Auction Ended');
        }
      } catch (err) {
        alert('❌ Error fetching auction');
        console.error(err);
      }
    };
    fetchAuction();
  }, [id, userId]);

  useEffect(() => {
    socket.on('newBid', (data) => {
      if (bidSound.current) bidSound.current.play();

      setMessages((prev) => [...prev, `💰 Rs. ${data.amount} by ${data.bidderName}`]);
      setAuction((prev) => ({
        ...prev,
        currentBid: data.amount,
        endTime: data.newEndTime,
        bids: [
          ...prev.bids,
          {
            bidder: { _id: data.bidder, name: data.bidderName },
            amount: data.amount,
            time: data.time
          }
        ]
      }));
    });

    socket.on('userCount', (count) => setActiveUsers(count));
    socket.on('uniqueBidders', (count) => setUniqueBidders(count));
    socket.on('bidError', (msg) => alert(msg));

    return () => {
      socket.off('newBid');
      socket.off('userCount');
      socket.off('uniqueBidders');
      socket.off('bidError');
    };
  }, []);

  useEffect(() => {
    if (!auction) return;

    const interval = setInterval(() => {
      const end = dayjs(auction.endTime);
      const now = dayjs();

      if (now.isAfter(end)) {
        clearInterval(interval);
        setIsEnded(true);
        setTimeLeft('Auction Ended');
        const last = auction.bids?.[auction.bids.length - 1];
        const winnerName = last?.bidder?.name || 'Unknown';
        setWinner(winnerName);
        confetti();
        if (winSound.current) winSound.current.play();
      } else {
        const diff = dayjs.duration(end.diff(now));
        setTimeLeft(`${diff.minutes()}m ${diff.seconds()}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  const handleBid = () => {
    if (!bid || isNaN(bid)) return alert('Enter valid bid');
    socket.emit('placeBid', { auctionId: id, userId, amount: parseInt(bid) });
    setBid('');
  };

  if (!auction) return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10 px-4">
      <audio ref={bidSound} src="/sounds/bid.wav" preload="auto" />
      <audio ref={winSound} src="/sounds/winner.wav" preload="auto" />

      <div className="max-w-4xl mx-auto bg-gray-800 border border-blue-500/20 shadow-xl rounded-2xl p-6">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          🎯 {auction.title}
        </h2>
        <p className="text-center text-sm text-gray-400 mb-4">
          👥 {activeUsers} viewing • 🧑 {uniqueBidders} unique bidders
        </p>

        <img
          src={`http://localhost:5000/uploads/${auction.image}`}
          alt={auction.title}
          className="rounded-lg w-full max-w-md mx-auto mb-6 border border-gray-700"
        />

        <div className="grid grid-cols-2 gap-4 mb-4 text-lg">
          <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <div className="text-gray-300">Current Bid</div>
            <div className="text-green-400 text-2xl font-bold">Rs. {auction.currentBid}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <div className="text-gray-300">Time Left</div>
            <div className="text-yellow-400 text-2xl font-bold">{timeLeft}</div>
          </div>
        </div>

        {!isEnded ? (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 ring-blue-500"
              type="number"
              placeholder="Enter your bid"
            />
            <button
              onClick={handleBid}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              💸 Place Bid
            </button>
          </div>
        ) : (
          <div className="text-center bg-red-700/30 border border-red-600 p-4 rounded-lg mb-6">
            <p className="text-red-300 font-semibold">⛔ Auction Ended</p>
            {winner && <p className="mt-2 text-green-400 font-bold">🏆 Winner: {winner}</p>}
          </div>
        )}

        {/* Feed */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">📢 Live Bidding Feed</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto text-sm">
            {messages.map((msg, i) => (
              <div key={i} className="bg-blue-800/30 border border-blue-500 px-3 py-1 rounded">
                {msg}
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">📜 Bid History</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
            {auction.bids.map((b, i) => (
              <div key={i} className="bg-gray-700 border border-gray-600 px-3 py-2 rounded">
                🧑 {b.bidder?.name || 'User'} bid Rs. {b.amount} at{' '}
                {new Date(b.time).toLocaleTimeString()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidRoom;
