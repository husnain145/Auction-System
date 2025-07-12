import { useEffect, useState } from 'react';
import { fetchAuctions } from '../api/auction';
import AuctionCard from '../components/AuctionCard';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const getAuctions = async () => {
      try {
        const res = await fetchAuctions();
        setAuctions(res.data);
      } catch (err) {
        alert('Failed to load auctions');
      }
    };
    getAuctions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10 relative overflow-hidden">
      {/* Gradient Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600 opacity-20 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500 opacity-20 rounded-full blur-3xl animate-pulse -z-10"></div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
        🚀 Live Auctions
      </h2>

      <p className="text-center text-gray-400 mb-8 text-sm">
        Browse and place your bids on hot items before time runs out!
      </p>

      {/* Content */}
      {auctions.length === 0 ? (
        <div className="text-center text-gray-400 text-lg mt-10">
          <div className="animate-pulse text-blue-400">Fetching live auctions...</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {auctions.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Auctions;
