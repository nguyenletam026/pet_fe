import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import Header from './Header';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  avtUrl: string;
}

interface ServiceType {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  avtUrl: string;
}

interface Booking {
  id: string;
  shopName: string;
  userName: string;
  serviceTypeResponse: ServiceType;
  bookingTime: string;
  status: string;
  pet: Pet;
  totalPrice: number;
  paymentMethod: string;
}

interface ApiResponse {
  code: number;
  message: string;
  result: Booking[];
}

const Schedule: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get<ApiResponse>('/bookings/user');
        setBookings(response.data.result);
      } catch (err) {
        setError('Không thể tải danh sách đặt lịch. Vui lòng thử lại.');
        console.error('Lỗi khi tải danh sách đặt lịch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-purple-800">Lịch Hẹn Của Tôi</h1>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            {bookings.slice(0, 2).map((booking) => {
              const formattedDate = new Date(booking.bookingTime).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });
              const formattedTime = new Date(booking.bookingTime).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full sm:w-[calc(50%-1.5rem)]"
                >
                  {/* Header Section */}
                  <div className="bg-purple-100 text-center py-4">
                    <h2 className="text-xl font-bold text-purple-800">
                      Lịch hẹn của bạn đã được xác nhận!
                    </h2>
                  </div>

                  {/* Main Content */}
                  <div className="divide-y divide-gray-200">
                    {/* Booking Amount Section */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Số Tiền Đặt Lịch</h3>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Số Tiền Đơn Hàng</span>
                        <span>{booking.totalPrice}VNĐ</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-3">
                        <span>Tổng Cộng</span>
                        <span>{booking.totalPrice}  VNĐ</span>
                      </div>
                    </div>

                    {/* Booking Details Section */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Chi Tiết Đặt Lịch</h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          <span className="font-medium">Dịch Vụ:</span>{' '}
                          {booking.serviceTypeResponse.name}
                        </p>
                        <p>
                          <span className="font-medium">Cửa Hàng:</span> {booking.shopName}
                        </p>
                        <p>
                          <span className="font-medium">Ngày & Giờ:</span> {formattedDate}{' '}
                          {formattedTime}
                        </p>
                      </div>
                    </div>

                    {/* Pet Information Section */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Thông Tin Thú Cưng</h3>
                      <div className="flex items-center">
                        <img
                          src={booking.pet.avtUrl}
                          alt={booking.pet.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="ml-4 text-sm text-gray-700">
                          <p className="mb-1">
                            <span className="font-medium">Tên Thú Cưng:</span> {booking.pet.name}
                          </p>
                          <p>
                            <span className="font-medium">Loài & Giống:</span>{' '}
                            {booking.pet.species} ({booking.pet.breed})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="p-6">
                      <div
                        className={`w-full py-3 rounded-lg text-center font-semibold ${
                          booking.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PAID'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status === 'SUCCESS'
                          ? 'THÀNH CÔNG'
                          : booking.status === 'PAID'
                          ? 'ĐÃ THANH TOÁN' 
                          : booking.status === 'CANCELLED'
                          ? 'ĐÃ HỦY'
                          : booking.status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;