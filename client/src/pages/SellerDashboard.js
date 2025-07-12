import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const SellerDashboard = () => {
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
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    startingBid: '',
    endTime: '',
  });

  const fetchSellerAuctions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auctions/seller/my-auctions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctions(res.data);
    } catch {
      alert('Failed to load your auctions');
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
      setForm({ title: '', description: '', category: '', startingBid: '', endTime: '' });
      setImage(null);
      fetchSellerAuctions();
    } catch {
      alert('❌ Auction creation failed');
    }
  };

  const deleteAuction = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auctions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSellerAuctions();
    } catch {
      alert('Failed to delete auction');
    }
  };

  const startEditing = (auction) => {
    setEditingId(auction._id);
    setEditForm({
      title: auction.title,
      description: auction.description || '',
      category: auction.category || '',
      startingBid: auction.startingBid,
      endTime: auction.endTime?.slice(0, 16),
    });
  };

  const updateAuction = async () => {
    try {
      await axios.put(`http://localhost:5000/api/auctions/${editingId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Auction updated');
      setEditingId(null);
      fetchSellerAuctions();
    } catch {
      alert('Update failed');
    }
  };

  useEffect(() => {
    fetchSellerAuctions();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <h2 className="text-4xl font-bold text-center text-blue-400 mb-8">
        📦 Seller Dashboard
      </h2>

      {/* Create Auction */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl mb-10 max-w-3xl mx-auto border border-gray-700">
        <h3 className="text-2xl font-semibold mb-4 text-green-400">Create New Auction</h3>
        <form onSubmit={handleCreateAuction} className="grid gap-4" encType="multipart/form-data">
          {['title', 'description', 'category', 'startingBid', 'endTime'].map((field, idx) => (
            <input
              key={idx}
              type={field === 'startingBid' ? 'number' : field === 'endTime' ? 'datetime-local' : 'text'}
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required={field !== 'description'}
            />
          ))}
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
            className="text-white"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 rounded transition shadow"
          >
            🚀 Create Auction
          </button>
        </form>
      </div>

      {/* Auction List */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-semibold mb-4">Your Auctions</h3>
        {auctions.length === 0 ? (
          <p className="text-gray-400">You have no auctions yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {auctions.map((a) => (
              <div
                key={a._id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg hover:shadow-2xl transition duration-300"
              >
                <h4 className="text-lg font-bold text-blue-300 mb-1">{a.title}</h4>
                <p className="text-sm text-gray-400 mb-1">Category: {a.category}</p>
                <p>Status: <span className="text-yellow-400">{a.status}</span></p>
                <p>Current Bid: <span className="text-green-400">Rs. {a.currentBid}</span></p>
                {a.bids.length > 0 && a.status === 'ended' && (
                  <p className="text-purple-400 mt-1">🏆 Winner: {a.bids[a.bids.length - 1]?.bidder?.name}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => deleteAuction(a._id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-white text-sm"
                  >
                    ❌ Delete
                  </button>
                  {a.status !== 'ended' && (
                    <button
                      onClick={() => startEditing(a)}
                      className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 rounded text-black text-sm"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Section */}
      {editingId && (
        <div className="bg-gray-800 mt-12 p-6 rounded-xl shadow-xl max-w-3xl mx-auto border border-gray-700">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">✏️ Edit Auction</h3>
          <div className="grid gap-4">
            <input
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <input
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
            />
            <input
              type="number"
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2"
              value={editForm.startingBid}
              onChange={(e) => setEditForm({ ...editForm, startingBid: e.target.value })}
            />
            <input
              type="datetime-local"
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2"
              value={editForm.endTime}
              onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
            />
            <textarea
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Description"
            />
            <div className="flex gap-2">
              <button
                onClick={updateAuction}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
              >
                ✅ Update
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
