import { Link } from 'react-router-dom';

const AuctionCard = ({ auction }) => {
  const { _id, title, image, currentBid, status } = auction;

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-xl border border-gray-700 transition">
      <h3 className="text-xl font-bold text-blue-400 mb-2">{title}</h3>
      <img
        src={`http://localhost:5000/uploads/${image}`}
        alt={title}
        className="w-full h-48 object-cover rounded mb-3"
      />
      <p className="text-green-400 font-medium">Rs. {currentBid}</p>
      <p className={`text-sm mb-3 ${status === 'ended' ? 'text-red-400' : 'text-yellow-400'}`}>
        {status.toUpperCase()}
      </p>

      {status === 'live' ? (
        <Link to={`/auction/${_id}`}>
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded font-semibold transition">
            🛎️ Bid Now
          </button>
        </Link>
      ) : (
        <Link to={`/auction/${_id}`}>
          <button className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white py-2 rounded font-semibold transition">
            📜 View Bid History
          </button>
        </Link>
      )}
    </div>
  );
};

export default AuctionCard;
