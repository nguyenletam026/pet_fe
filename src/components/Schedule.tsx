import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{booking.shopName}</h2>
                <p className="text-gray-600">Service: {booking.serviceTypeResponse.name}</p>
                <p className="text-gray-600">
                  Date: {new Date(booking.bookingTime).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  Time: {new Date(booking.bookingTime).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  ${booking.totalPrice.toFixed(2)}
                </p>
                <span className="inline-block px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                  {booking.status}
                </span>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold">Pet Information</h3>
              <div className="flex items-center mt-2">
                <img
                  src={booking.pet.avtUrl}
                  alt={booking.pet.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-3">
                  <p className="font-medium">{booking.pet.name}</p>
                  <p className="text-sm text-gray-600">
                    {booking.pet.breed} ({booking.pet.species})
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;