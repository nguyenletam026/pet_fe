import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import { FaSearch, FaHeart, FaShoppingCart, FaPhone, FaUser, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';

interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avtUrl?: string;
}

const Header = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/myInfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      setUserData(response.data.result);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  return (
    <header className="bg-gradient-to-r from-white-50 to-cyan-100 text-black shadow-lg mt-0">
      {/* Top Header */}
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
        {/* Logo & Search */}
        <div className="flex items-center space-x-8">
          <Link to="/home" className="flex items-center hover:opacity-80 transition-opacity duration-300">
            <img
              src="https://img.freepik.com/premium-vector/pet-logo-design_721155-2352.jpg"
              alt="VetTrack Logo"
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
            />
            <span className="ml-3 text-2xl font-bold tracking-tight">VetTrack</span>
          </Link>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ, shop..."
              className="p-3 pl-12 rounded-full text-gray-800 w-96 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm"
            />
            <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-8">
          
          <Link
            to="/wishlist"
            className="flex items-center hover:text-blue-200 transition-colors duration-300"
          >
            <FaHeart className="mr-2" /> Wishlist
          </Link>
          <Link
            to="/schedule"
            className="flex items-center hover:text-blue-200 transition-colors duration-300"
          >
            <FaCalendarAlt className="mr-2" /> Xem Lịch
          </Link>
          
          {token && userData ? (
  <div className="relative group">
    <Link
      to="/profile"
      className="flex items-center hover:text-blue-200 transition-colors duration-300"
    >
      <img
        src={userData.avtUrl || 'https://via.placeholder.com/40'}
        alt="User Avatar"
        className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md"
      />
      <span className="ml-2 text-sm font-medium">{userData.firstName}</span>
    </Link>
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-200">
      <div className="py-2">
        <Link
          to="/profile"
          className="flex items-center px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 text-sm transition-colors duration-200"
        >
          <FaUser className="mr-2 text-gray-600" /> My Profile
        </Link>
        <Link
          to="/schedule"
          className="flex items-center px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 text-sm transition-colors duration-200"
        >
          <FaCalendarAlt className="mr-2 text-gray-600" /> My Schedule
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
          className="flex items-center w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 text-sm transition-colors duration-200"
        >
          <FaSignOutAlt className="mr-2 text-gray-600" /> Logout
        </button>
      </div>
    </div>
  </div>
) : (
            <Link
              to="/login"
              className="flex items-center hover:text-blue-200 transition-colors duration-300"
            >
              <FaUser className="mr-2" /> Đăng Nhập
            </Link>
          )}
          <Link
            to="/cart"
            className="relative flex items-center hover:text-blue-200 transition-colors duration-300"
          >
            <FaShoppingCart className="text-lg" size={18} />
            <span className="ml-2 text-sm font-medium">Giỏ Hàng</span>
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
              
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;