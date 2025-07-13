import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    startingBid: '',
    endTime: '',
  });
  const [image, setImage] = useState(null);

  const fetchAuctions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auctions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Fix: Safely handle the response whether it's wrapped in `auctions` or not
      const data = res.data;
      const auctionList = Array.isArray(data.auctions) ? data.auctions : data;
      setAuctions(auctionList);

    } catch (error) {
      console.error('Fetch Auctions Error:', error);
      alert('Failed to load auctions');
    }
  };

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (image) formData.append('image', image);

      await axios.post('http://localhost:5000/api/auctions', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('✅ Auction created');
      fetchAuctions();
      setForm({ title: '', description: '', category: '', startingBid: '', endTime: '' });
      setImage(null);
    } catch (err) {
      console.error('Create Auction Error:', err);
      alert('❌ Auction creation failed');
    }
  };

  const deleteAuction = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auctions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAuctions();
    } catch {
      alert('❌ Delete failed');
    }
  };

  const endAuction = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/auctions/${id}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAuctions();
    } catch {
      alert('❌ End failed');
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
        👑 Admin Auction Panel
      </h2>

      {/* Auction Creation Form */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto mb-14">
        <h3 className="text-2xl font-semibold mb-4 text-green-400">➕ Create New Auction</h3>
        <form onSubmit={handleCreateAuction} className="grid gap-4" encType="multipart/form-data">
          {['title', 'description', 'category'].map((field, i) => (
            <input
              key={i}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="bg-gray-700 px-4 py-2 rounded border border-gray-600 focus:ring-2 focus:ring-blue-400 transition"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required={field !== 'description'}
            />
          ))}
          <input
            type="number"
            name="startingBid"
            placeholder="Starting Bid"
            className="bg-gray-700 px-4 py-2 rounded border border-gray-600 focus:ring-2 focus:ring-blue-400"
            value={form.startingBid}
            onChange={(e) => setForm({ ...form, startingBid: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            name="endTime"
            className="bg-gray-700 px-4 py-2 rounded border border-gray-600 focus:ring-2 focus:ring-blue-400"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="text-white"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded font-semibold shadow-md transition"
          >
            🚀 Create Auction
          </button>
        </form>
      </div>

      {/* Auction Cards */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-semibold mb-4">📋 All Auctions</h3>
        {auctions.length === 0 ? (
          <p className="text-gray-400 text-center">No auctions found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {auctions.map((a) => (
              <div
                key={a._id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-2xl transition duration-300"
              >
                <h4 className="text-xl font-bold text-blue-400 mb-1">{a.title}</h4>
                <p className="text-sm text-gray-400 mb-1">Category: {a.category}</p>
                <p>Status: <span className="text-yellow-400">{a.status}</span></p>
                <p>Current Bid: <span className="text-green-400">Rs. {a.currentBid}</span></p>
                {a.bids?.length > 0 && a.status === 'ended' && (
                  <p className="text-purple-300 mt-1">
                    🏆 Winner: {a.bids[a.bids.length - 1]?.bidder?.name}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => deleteAuction(a._id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
                  >
                    ❌ Delete
                  </button>
                  {a.status !== 'ended' && (
                    <button
                      onClick={() => endAuction(a._id)}
                      className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-black text-sm"
                    >
                      ⏹ Force End
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
