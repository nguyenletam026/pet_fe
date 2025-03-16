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
        setError('Failed to fetch bookings. Please try again.');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

    <div className=" mx-100px p-4">
      
      <h1 className="text-2xl font-bold mb-4 text-center text-purple-800">My Bookings</h1>
      <div className="grid gap-6">
        {bookings.map((booking) => {
          const formattedDate = new Date(booking.bookingTime).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
          const formattedTime = new Date(booking.bookingTime).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={booking.id} className="bg-white rounded-lg shadow-lg overflow-hidden max-w-lg mx-auto">
              {/* Header Section */}
              <div className="bg-purple-100 text-center py-4">
                <h2 className="text-xl font-bold text-purple-800">
                  {booking.userName}, your booking has been confirmed!
                </h2>
              </div>

              {/* Booking Amount Section */}
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold mb-2">Booking Amounts</h3>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Order Amount</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Application Fee & Taxes</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-semibold mt-2">
                  <span>Total</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Booking Details Section */}
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold mb-2">Booking Details</h3>
                <div className="text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Service:</span> {booking.serviceTypeResponse.name}
                  </p>
                  <p>
                    <span className="font-medium">Shop:</span> {booking.shopName}
                  </p>
                  <p>
                    <span className="font-medium">Date & Time:</span> {formattedDate} {formattedTime}
                  </p>
                </div>
              </div>

              {/* Pet Information Section */}
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold mb-2">Pet Information</h3>
                <div className="flex items-center">
                  <img
                    src={booking.pet.avtUrl}
                    alt={booking.pet.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Pet Name:</span> {booking.pet.name}
                    </p>
                    <p>
                      <span className="font-medium">Species & Breed:</span> {booking.pet.species} (
                      {booking.pet.breed})
                    </p>
                  </div>
                </div>
              </div>

              {/* Date and Booking ID Section */}
              <div className="flex justify-center p-4">
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {new Date(booking.bookingTime).getDate()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.bookingTime).toLocaleString('default', { month: 'short' })}-
                    {new Date(booking.bookingTime).getFullYear()}
                  </p>
                  <p className="text-xs font-semibold text-gray-800 mt-2">
                    Booking ID: {booking.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              {/* Print Button */}
              <div className="p-4">
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                  Print Booking
                </button>
              </div>

              {/* Promotional Banner */}
              
              
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
};

export default Schedule;