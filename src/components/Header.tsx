import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import { FaSearch, FaHeart, FaShoppingCart, FaPhone, FaUser, FaSignOutAlt } from 'react-icons/fa';

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
    <header className="bg-gradient-to-r from-blue-500 via-white-500 to-blue-100 text-black shadow-xl">
      {/* Top Header */}
      <div className="flex justify-between items-center px-4 py-3 w-full">
        {/* Logo & Search */}
        <div className="flex items-center space-x-6">
          <Link to="/home" className="flex items-center">
            <img
              src="https://img.freepik.com/premium-vector/pet-logo-design_721155-2352.jpg"
              alt="VetTrack Logo"
              className="h-10 w-10 rounded-full object-cover border-2 border-black"
            />
            <span className="ml-2 text-xl font-semibold tracking-tight">VetTrack</span>
          </Link>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ, shop..."
              className="p-2 pl-10 rounded-full text-black w-80 bg-gray-100 border-2 border-black focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300"
            />
            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-black" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          <span className="flex items-center text-sm text-black">
            <FaPhone className="mr-1 text-black" /> Hotline: <strong>0867 7891</strong>
          </span>
          <Link to="/wishlist" className="flex items-center text-black hover:text-gray-600 transition-colors">
            <FaHeart className="mr-1 text-black" /> Wishlist
          </Link>
          {token && userData ? (
            <div className="relative group">
              <Link to="/profile" className="flex items-center text-black hover:text-gray-600 transition-colors">
                <img
                  src={userData.avtUrl || 'https://via.placeholder.com/40'}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full border-2 border-black object-cover"
                />
                <span className="ml-2 text-sm font-medium">{userData.firstName}</span>
              </Link>
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl py-2 z-20 hidden group-hover:block transition-all duration-200 border-2 border-black">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-black hover:bg-gray-100 hover:text-gray-900 text-sm"
                >
                  <FaUser className="mr-2 text-black" /> My Profile
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.reload();
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-black hover:bg-gray-100 hover:text-gray-900 text-sm"
                >
                  <FaSignOutAlt className="mr-2 text-black" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center text-black hover:text-gray-600 transition-colors">
              <FaUser className="mr-1 text-black" /> Đăng Nhập
            </Link>
          )}
          <Link to="/cart" className="relative flex items-center text-black hover:text-gray-600 transition-colors">
            <FaShoppingCart className="text-lg text-black" size={16} />
            <span className="ml-1 text-base font-medium">Giỏ Hàng (0)</span>
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Link>
        </div>
      </div>

    </header>
  );
};

export default Header;