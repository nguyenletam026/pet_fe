import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import { Link } from 'react-router-dom';
import Header from './Header';
import { FaMapMarkerAlt, FaPhone, FaMap, FaCalendarCheck, FaDollarSign, FaClock, FaPaw, FaStar } from 'react-icons/fa';

interface ServiceType {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  avtUrl?: string | null;
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
  distance?: number;
}

interface GeocodeResponse {
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
  status: string;
}

interface DirectionsResponse {
  routes: {
    legs: {
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
    }[];
  }[];
}

const ServicePage = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const token = localStorage.getItem('token');
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });

  // Fetch user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
        }
      );
    } else {
      console.error('Trình duyệt của bạn không hỗ trợ định vị địa lý.');
    }
  }, []);

  // Fetch service types
  useEffect(() => {
    const fetchServiceTypes = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/service-types');
        const serviceTypesData = response.data.result || [];
        setServiceTypes(serviceTypesData);
      } catch (err) {
        setError('Vui Lòng Đăng Nhập Để Xem Dịch Vụ.');
        console.error('Fetch service types error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceTypes();
  }, []);

  useEffect(() => {
    if (selectedServiceType) {
      const fetchShopsAndDistances = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get('/shops/getAllShops');
          let shopsData: Shop[] = response.data.result || [];

          const filtered = shopsData.filter((shop: Shop) =>
            shop.services.some((service: Service) => service.serviceTypeId === selectedServiceType)
          );

          if (userLat && userLng && filtered.length > 0) {
            const shopsWithDistances = await Promise.all(
              filtered.map(async (shop: Shop) => {
                try {
                  const geocodeResponse = await axios.get<GeocodeResponse>(
                    `https://rsapi.goong.io/geocode?address=${encodeURIComponent(shop.address)}&api_key=Vdl76qC064CJ5q05tJfCqrSW51c8FWnh5uGIAPVa`
                  );

                  if (geocodeResponse.data.status === 'OK' && geocodeResponse.data.results.length > 0) {
                    const shopLocation = geocodeResponse.data.results[0].geometry.location;

                    const directionsResponse = await axios.get<DirectionsResponse>(
                      `https://rsapi.goong.io/Direction?origin=${userLat},${userLng}&destination=${shopLocation.lat},${shopLocation.lng}&vehicle=bike&api_key=Vdl76qC064CJ5q05tJfCqrSW51c8FWnh5uGIAPVa`
                    );

                    if (directionsResponse.data.routes.length > 0) {
                      const distance = directionsResponse.data.routes[0].legs[0].distance.value;
                      return { ...shop, distance };
                    }
                  }
                  return { ...shop, distance: Infinity };
                } catch (err) {
                  console.error(`Error calculating distance for shop ${shop.name}:`, err);
                  return { ...shop, distance: Infinity };
                }
              })
            );

            const sortedShops = shopsWithDistances.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            setFilteredShops(sortedShops);
          } else {
            setFilteredShops(filtered);
          }
        } catch (err) {
          setError('Vui Lòng Đăng Nhập Để Xem Dịch Vụ');
          console.error('Fetch shops error:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchShopsAndDistances();
    } else {
      setFilteredShops([]);
    }
  }, [selectedServiceType, userLat, userLng]);

  const formatDistance = (distance: number | undefined) => {
    if (distance === undefined || distance === Infinity) {
      return 'N/A';
    }
    if (distance < 1000) {
      return `${distance} m`;
    }
    return `${(distance / 1000).toFixed(1)} km`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-100 to-white-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-100 flex-1 px-4 py-12">
        <div className="container mx-auto">
          {/* Title */}
          <h2 className="text-5xl font-extrabold text-gray-800 mb-12 text-center">
            <FaPaw className="inline-block mr-3 text-amber-600" /> Dịch Vụ Thú Cưng
          </h2>

          {/* Service Types Display */}
          <div className="mb-16">
            <h3 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
              Chọn Loại Dịch Vụ
            </h3>
            <div className="flex justify-center gap-6 overflow-x-auto pb-4">
              {serviceTypes.map((type) => (
                <div
                  key={type.id}
                  className={`group flex flex-col items-center cursor-pointer p-4 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-xl bg-white shadow-md border border-yellow-200 ${
                    selectedServiceType === type.id ? 'bg-amber-50 scale-110 shadow-xl border-amber-500' : ''
                  } animate-fadeIn`}
                  onClick={() => setSelectedServiceType(type.id)}
                >
                  <img
                    src={type.avtUrl || 'https://via.placeholder.com/80'}
                    alt={type.name}
                    className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-yellow-200 group-hover:border-amber-500 transition-all duration-300"
                  />
                  <p className="text-gray-800 font-semibold text-lg">{type.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Display Selected Service Type Info */}
          {selectedServiceType && (
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-16 mx-auto max-w-2xl border border-yellow-200 animate-fadeIn">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {serviceTypes.find((type) => type.id === selectedServiceType)?.name}
              </h3>
              <div className="space-y-4 text-gray-700">
                <p className="flex items-center gap-3">
                  <FaDollarSign className="text-amber-600" />{' '}
                  {serviceTypes.find((type) => type.id === selectedServiceType)?.price.toLocaleString()} VND
                </p>
                <p className="flex items-center gap-3">
                  <FaClock className="text-amber-600" />{' '}
                  {serviceTypes.find((type) => type.id === selectedServiceType)?.duration} phút
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Mô tả:</span>{' '}
                  {serviceTypes.find((type) => type.id === selectedServiceType)?.description}
                </p>
              </div>
            </div>
          )}

          {/* Display Filtered Shops */}
          <div>
            <h3 className="text-3xl font-semibold text-gray-800 mb-10 text-center">
              Danh Sách Shop
            </h3>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {loading && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-600 border-opacity-75"></div>
              </div>
            )}
            {filteredShops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredShops.map((shop, index) => (
                  <div
                    key={shop.id}
                    className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl border border-yellow-200 animate-fadeIn ${
                      index === 0 && shop.distance !== Infinity ? 'border-amber-500 glow' : ''
                    }`}
                  >
                    {/* Nearest Shop Badge */}
                    {index === 0 && shop.distance !== Infinity && (
                      <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                        <FaStar className="text-white" /> Gần nhất
                      </div>
                    )}
                    {shop.avtUrl ? (
                      <img
                        src={shop.avtUrl}
                        alt={`${shop.name} avatar`}
                        className="w-full h-60 object-cover"
                      />
                    ) : (
                      <div className="w-full h-60 bg-yellow-100 flex items-center justify-center">
                        <span className="text-gray-400">Không có ảnh</span>
                      </div>
                    )}
                    <div className="p-6">
                      <h4 className="text-2xl font-bold text-gray-800 mb-4">{shop.name}</h4>
                      <div className="space-y-3 mb-4 text-gray-700">
                        <p className="flex items-center gap-3">
                          <FaMapMarkerAlt className="text-amber-600" /> {shop.address}
                        </p>
                        <p className="flex items-center gap-3">
                          <FaPhone className="text-amber-600" /> {shop.phoneNumber}
                        </p>
                        <p className="flex items-center gap-3">
                          <FaMap className="text-amber-600" /> {formatDistance(shop.distance)}
                        </p>
                      </div>
                      <div className="mb-4">
                        <h5 className="text-lg font-medium text-gray-800 mb-2">Dịch vụ</h5>
                        {shop.services.length > 0 ? (
                          <ul className="space-y-2">
                            {shop.services
                              .filter((service) => service.serviceTypeId === selectedServiceType)
                              .map((service) => (
                                <li key={service.id} className="text-gray-600 flex items-center gap-2">
                                  <FaPaw className="text-amber-600" /> {service.name} -{' '}
                                  {service.price.toLocaleString()} VND ({service.duration} phút)
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">Chưa có dịch vụ.</p>
                        )}
                      </div>
                      <Link
                        to="/booking"
                        state={{
                          serviceTypeId: selectedServiceType,
                          shopId: shop.id,
                          serviceType: serviceTypes.find((type) => type.id === selectedServiceType),
                          shop: shop,
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 shadow-md"
                      >
                        <FaCalendarCheck className="text-xl" /> Đặt lịch
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedServiceType ? (
              <p className="text-gray-500 text-center">
                Không có shop nào cung cấp dịch vụ này.
              </p>
            ) : (
              <p className="text-gray-500 text-center">
                Vui lòng chọn một loại dịch vụ.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 border-t border-yellow-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 VetTrack. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-amber-400 transition-colors">Chính sách</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Liên hệ</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Điều khoản</a>
          </div>
        </div>
      </footer>

      {/* Custom CSS for Animations and Glow Effect */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .glow {
          box-shadow: 0 0 20px rgba(217, 119, 6, 0.5), 0 0 40px rgba(217, 119, 6, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ServicePage;