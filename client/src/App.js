import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Auctions from './pages/Auctions';
import BidRoom from './pages/BidRoom';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import SellerDashboard from './pages/SellerDashboard';


function App() {
  return (
    <Router>
       <Navbar />
      <Routes >
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute allowedRoles={['admin', 'seller', 'bidder']}>
              <Auctions />
            </PrivateRoute>
          }
        />
        <Route
          path="/auction/:id"
          element={
            <PrivateRoute allowedRoles={['admin', 'bidder', 'seller']}>
              <BidRoom />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
  path="/seller"
  element={
    <PrivateRoute allowedRoles={['seller']}>
      <SellerDashboard />
    </PrivateRoute>
  }
/>
      </Routes>
    </Router>
  );
}

export default App;
