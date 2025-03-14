import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import { Link } from 'react-router-dom';
import Header from './Header';
interface ServiceType {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  shopId: string | null;
  serviceTypeId: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  services: Service[];
  avtUrl?: string;
}

const ServicePage = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });

  // Fetch service types
  useEffect(() => {
    const fetchServiceTypes = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/service-types');
        console.log('Fetch service types response:', response.data);
        const serviceTypesData = response.data.result || [];
        setServiceTypes(serviceTypesData);
      } catch (err) {
        setError('Failed to fetch service types. Please try again.');
        console.error('Fetch service types error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceTypes();
  }, []);

  // Fetch shops when a service type is selected
  useEffect(() => {
    if (selectedServiceTypeId) {
      const fetchShops = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get('/shops/getAllShops');
          console.log('Fetch shops response:', response.data);
          const shopsData = response.data.result || [];
          setShops(shopsData);

          // Filter shops that have the selected service type
          const filtered = shopsData.filter((shop: Shop) =>
            shop.services.some((service: Service) => service.serviceTypeId === selectedServiceTypeId)
          );
          setFilteredShops(filtered);
        } catch (err) {
          setError('Failed to fetch shops. Please try again.');
          console.error('Fetch shops error:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchShops();
    } else {
      setFilteredShops([]);
    }
  }, [selectedServiceTypeId]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <Header/>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Dịch Vụ Chăm Sóc Thú Cưng Tại Nhà</h2>
          
          {/* Service Type Selection */}
          <div className="mb-8 text-center">
            <label className="block text-gray-700 text-lg font-semibold mb-2">Chọn Loại Dịch Vụ</label>
            <select
              value={selectedServiceTypeId}
              onChange={(e) => setSelectedServiceTypeId(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs mx-auto"
            >
              <option value="">Chọn một loại dịch vụ</option>
              {serviceTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Display Selected Service Type Info */}
          {selectedServiceTypeId && (
            <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-8 mx-auto max-w-2xl">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">
                {serviceTypes.find((type) => type.id === selectedServiceTypeId)?.name}
              </h3>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Giá:</span>{' '}
                {serviceTypes.find((type) => type.id === selectedServiceTypeId)?.price.toLocaleString()} VND
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Thời gian:</span>{' '}
                {serviceTypes.find((type) => type.id === selectedServiceTypeId)?.duration} phút
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Mô tả:</span>{' '}
                {serviceTypes.find((type) => type.id === selectedServiceTypeId)?.description}
              </p>
            </div>
          )}

          {/* Display Filtered Shops */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Danh Sách Shop Cung Cấp Dịch Vụ
            </h3>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {loading && <p className="text-gray-500 text-center mb-4">Đang tải...</p>}
            {filteredShops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShops.map((shop) => (
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
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">{shop.name}</h4>
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Địa chỉ:</span> {shop.address}
                      </p>
                      <p className="text-gray-600 mb-4">
                        <span className="font-medium">SĐT:</span> {shop.phoneNumber}
                      </p>
                      <div className="mb-4">
                        <h5 className="text-lg font-medium text-gray-700 mb-2">Dịch vụ</h5>
                        {shop.services.length > 0 ? (
                          <ul className="space-y-1">
                            {shop.services
                              .filter((service) => service.serviceTypeId === selectedServiceTypeId)
                              .map((service) => (
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
            ) : selectedServiceTypeId ? (
              <p className="text-gray-500 text-center">Không có shop nào cung cấp dịch vụ này.</p>
            ) : (
              <p className="text-gray-500 text-center">Vui lòng chọn một loại dịch vụ để xem các shop.</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 VetTrack. All rights reserved.</p>
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

export default ServicePage;