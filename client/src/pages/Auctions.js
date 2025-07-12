import { useEffect, useState } from 'react';
import { fetchAuctions } from '../api/auction';
import AuctionCard from '../components/AuctionCard';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    name: '',
    status: '',
    minPrice: '',
    maxPrice: ''
  });

  // Fetch auctions when filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const getAuctions = async () => {
        try {
          const res = await fetchAuctions(filters);
          setAuctions(res.data);
        } catch {
          alert('Failed to load auctions');
        }
      };
      getAuctions();
    }, 400); // debounce typing delay

    return () => clearTimeout(delayDebounce); // cleanup timeout
  }, [filters]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10 relative overflow-hidden">
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-7xl mx-auto mb-8">
        <input type="text" name="name" placeholder="Search name" value={filters.name} onChange={handleChange}
          className="bg-gray-700 px-3 py-2 rounded text-white border border-gray-600" />
        <input type="text" name="category" placeholder="Category" value={filters.category} onChange={handleChange}
          className="bg-gray-700 px-3 py-2 rounded text-white border border-gray-600" />
        <select name="status" value={filters.status} onChange={handleChange}
          className="bg-gray-700 px-3 py-2 rounded text-white border border-gray-600">
          <option value="">All Statuses</option>
          <option value="live">Live</option>
          <option value="ended">Ended</option>
        </select>
        <input type="number" name="minPrice" placeholder="Min Price" value={filters.minPrice} onChange={handleChange}
          className="bg-gray-700 px-3 py-2 rounded text-white border border-gray-600" />
        <input type="number" name="maxPrice" placeholder="Max Price" value={filters.maxPrice} onChange={handleChange}
          className="bg-gray-700 px-3 py-2 rounded text-white border border-gray-600" />
      </div>

      {/* Auction Cards */}
      {auctions.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No auctions found.</p>
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
