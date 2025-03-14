import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import { FaSearch, FaHeart, FaShoppingCart, FaPhone, FaUser, FaSignOutAlt, FaDog, FaCat, FaBone, FaPaw, FaNewspaper, FaTags } from 'react-icons/fa';

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
        }
      });
      setUserData(response.data.result);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-xl">
      {/* Top Header */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo & Search */}
        <div className="flex items-center space-x-6">
          <Link to="/home" className="flex items-center">
            <img
              src="https://img.freepik.com/premium-vector/pet-logo-design_721155-2352.jpg"
              alt="VetTrack Logo"
              className="h-12 w-12 rounded-full object-cover shadow-md"
            />
            <span className="ml-2 text-xl font-bold tracking-tight">VetTrack</span>
          </Link>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ, shop..."
              className="p-2 pl-10 rounded-full text-gray-800 w-80 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300"
            />
            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          <span className="flex items-center text-sm">
            <FaPhone className="mr-1" /> Hotline: <strong>0867 7891</strong>
          </span>
          <a href="#" className="flex items-center hover:text-blue-200 transition-colors">
            <FaHeart className="mr-1" /> Wishlist
          </a>
          {token && userData ? (
            <div className="relative group">
              <Link to="/profile" className="flex items-center hover:text-blue-200 transition-colors">
                <img
                  src={userData.avtUrl || 'https://via.placeholder.com/40'}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm"
                />
                <span className="ml-2 text-sm font-medium">{userData.firstName}</span>
              </Link>
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl py-2 z-20 hidden group-hover:block transition-all duration-200">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-sm"
                >
                  <FaUser className="mr-2" /> My Profile
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.reload();
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-sm"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center hover:text-blue-200 transition-colors">
              <FaUser className="mr-1" /> Đăng Nhập
            </Link>
          )}
          <a href="#" className="flex items-center hover:text-blue-200 transition-colors">
            <FaShoppingCart className="mr-1" /> Giỏ Hàng (0)
          </a>
          
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-yellow-400 text-gray-800 px-4 py-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-8 text-sm font-medium">
            <a href="#" className="flex items-center hover:text-blue-600 transition-colors">
              <FaDog className="mr-1" /> Chó
            </a>
            <a href="#" className="flex items-center hover:text-blue-600 transition-colors">
              <FaCat className="mr-1" /> Mèo
            </a>
            <a href="#" className="flex items-center hover:text-blue-600 transition-colors">
              <FaBone className="mr-1" /> Thức ăn & Phụ kiện
            </a>
            <a href="#" className="flex items-center hover:text-blue-600 transition-colors">
              <FaPaw className="mr-1" /> Dịch vụ thú cưng
            </a>
            <a href="#" className="flex items-center hover:text-blue-600 transition-colors">
              <FaNewspaper className="mr-1" /> Tin tức
            </a>
            <a href="#" className="flex items-center hover:text-blue-600 transition-colors">
              <FaTags className="mr-1" /> Ưu đãi hôm nay
            </a>
          </div>
          <span className="text-sm font-semibold">
            Giảm đến 50% cho thành viên -{' '}
            <a href="#" className="underline hover:text-blue-600 transition-colors">
              Đăng ký ngay!
            </a>
          </span>
        </div>
      </nav>
    </header>
  );
};

export default Header;