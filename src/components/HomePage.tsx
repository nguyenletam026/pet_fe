import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import { Link } from 'react-router-dom';
import Header from './Header';
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  shopId: string | null;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  services: Service[];
  avtUrl?: string;
}

interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avtUrl?: string;
}

const HomePage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  const token = localStorage.getItem('token');
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });

  useEffect(() => {
    fetchShops();
    if (token) fetchUserData();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/shops/getAllShops');
      console.log('Fetch shops response:', response.data);
      const shopsData = response.data.result || [];
      setShops(shopsData);
    } catch (err) {
      setError('Failed to fetch shops. Please try again.');
      console.error('Fetch shops error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    setUserLoading(true);
    try {
      const response = await axiosInstance.get('/users/myInfo');
      setUserData(response.data.result);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-50">
      {/* Header */}
      <Header userData={userData} token={token} />  
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 text-white py-12">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-4">VETTRACK - NƠI THÚ CƯNG ĐƯỢC YÊU THƯƠNG</h1>
          <p className="text-xl mb-6">Dịch vụ và sản phẩm chuẩn chất lượng cho thú cưng của bạn!</p>
          <img
            src="https://img.freepik.com/free-vector/hand-drawn-pet-shop-facebook-cover-template_23-2150383109.jpg"
            alt="Banner Image"
            className="mx-auto rounded-lg shadow-md"
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center text-yellow-300">
          <span className="text-4xl">⭐</span>
          <span className="text-4xl">⭐</span>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img
              src="https://paddy.vn/cdn/shop/files/icon_web-01_320x.png?v=1692851925"
              alt="Free Shipping"
              className="h-16 mx-auto mb-4"
              loading="lazy"
            />
            <h3 className="text-lg font-semibold text-blue-600">Miễn phí vận chuyển</h3>
            <p className="text-gray-600">Giao hàng nhanh chóng</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img
              src="https://paddy.vn/cdn/shop/files/icon_web-02_320x.png?v=1692851981"
              alt="Authentic Product"
              className="h-16 mx-auto mb-4"
              loading="lazy"
            />
            <h3 className="text-lg font-semibold text-blue-600">Sản phẩm chính hãng</h3>
            <p className="text-gray-600">100% chất lượng cao</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img
              src="https://paddy.vn/cdn/shop/files/icon_web-03_320x.png?v=1692853446"
              alt="Easy Payment"
              className="h-16 mx-auto mb-4"
              loading="lazy"
            />
            <h3 className="text-lg font-semibold text-blue-600">Thanh toán tiện lợi</h3>
            <p className="text-gray-600">An toàn và nhanh chóng</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img
              src="https://paddy.vn/cdn/shop/files/icon_web-04_320x.png?v=1692853499"
              alt="Support"
              className="h-16 mx-auto mb-4"
              loading="lazy"
            />
            <h3 className="text-lg font-semibold text-blue-600">Hỗ trợ chuyên nghiệp</h3>
            <p className="text-gray-600">24/7 phục vụ tận tâm</p>
          </div>
        </div>
      </div>

      {/* Shopping Section */}
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 mb-6">Khám phá gợi ý mua sắm cho thú cưng của bạn</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Link
    to="/services" // Điều hướng đến trang mới
    className="bg-blue-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-blue-700 font-semibold text-center hover:bg-blue-200"
  >
    DỊCH VỤ CHĂM SÓC TẠI NHÀ
  </Link>
  <Link
    to="/shop"
    className="bg-pink-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-pink-700 font-semibold text-center hover:bg-pink-200"
  >
    MUA SẮM PHỤ KIỆN
  </Link>
  <Link
    to="/shop"
    className="bg-green-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-green-700 font-semibold text-center hover:bg-green-200"
  >
    MUA SẮM THỨC ĂN
  </Link>
</div>
        <button className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors">
          Liên hệ hỗ trợ
        </button>
      </div>

      {/* Shops List */}
      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Khám Phá Các Shop Thú Cưng</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {loading && <p className="text-gray-500 text-center mb-4">Đang tải...</p>}
          {shops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {shop.avtUrl ? (
                    <img
                      src={shop.avtUrl}
                      alt={`${shop.name} avatar`}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{shop.name}</h3>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Địa chỉ:</span> {shop.address}
                    </p>
                    <p className="text-gray-600 mb-4">
                      <span className="font-medium">SĐT:</span> {shop.phoneNumber}
                    </p>
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Dịch vụ</h4>
                      {shop.services.length > 0 ? (
                        <ul className="space-y-1">
                          {shop.services.map((service) => (
                            <li key={service.id} className="text-gray-600 text-sm">
                              <span className="font-medium">{service.name}</span> -{' '}
                              {service.price.toLocaleString()} VND ({service.duration} phút)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">Chưa có dịch vụ.</p>
                      )}
                    </div>
                    <Link
                      to={`/shop/${shop.id}`}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg text-center hover:bg-blue-700 transition-colors block"
                    >
                      Đặt lịch ngay
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && <p className="text-gray-500 text-center">Không có shop nào hiện tại.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">&copy; 2025 VetTrack. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-blue-300">Chính sách bảo mật</a>
            <a href="#" className="hover:text-blue-300">Liên hệ</a>
            <a href="#" className="hover:text-blue-300">Điều khoản sử dụng</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;