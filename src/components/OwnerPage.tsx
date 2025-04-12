import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  shopId: string | null;
}

interface ServiceType {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface ShopResponse {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  services: Service[];
  avtUrl?: string;
}

interface ShopRequest {
  name: string;
  address: string;
  phoneNumber: string;
}

interface ServiceRequest {
  serviceTypeId: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  avtUrl?: string | null;
}

interface ServiceTypeResponse {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  avtUrl: string;
}

interface User {
  address: string;
  numberPhone: string | null;
}

interface BookingResponse {
  id: string;
  shopName: string;
  serviceTypeResponse: ServiceTypeResponse;
  bookingTime: string;
  status: string;
  pet: Pet;
  totalPrice: number;
  user: User;
}

const OwnerPage = () => {
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [shopForm, setShopForm] = useState<ShopRequest>({
    name: '',
    address: '',
    phoneNumber: '',
  });
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceRequest>({
    serviceTypeId: '',
  });
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopNotExisted, setShopNotExisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'services' | 'bookings'>('shop');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });

  useEffect(() => {
    fetchMyShop();
    fetchServiceTypes();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchShopBookings();
    }
  }, [activeTab]);

  const fetchMyShop = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/shops/getMyShop');
      console.log('Fetch shop response:', response.data);
      const shopData = response.data.result;
      setShop(shopData);
      setShopForm({
        name: shopData.name || '',
        address: shopData.address || '',
        phoneNumber: shopData.phoneNumber || '',
      });
      setShopNotExisted(false);
    } catch (err: any) {
      if (err.response?.data?.code === 1015 && err.response?.data?.message === 'Shop not existed') {
        setShopNotExisted(true);
        setShop(null);
      } else {
        setError('Failed to fetch shop. Please try again.');
        console.error('Fetch shop error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchShopBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await axiosInstance.get('/bookings/shop');
      console.log('Fetch bookings response:', response.data);
      if (response.data.code === 1000) {
        setBookings(response.data.result || []);
      }
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error('Fetch bookings error:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchServiceTypes = async () => {
    try {
      const response = await axiosInstance.get('/service-types');
      console.log('Fetch service types response:', response.data);
      const serviceTypesData = response.data.result || [];
      setServiceTypes(serviceTypesData);
    } catch (err) {
      setError('Failed to fetch service types. Please try again.');
      console.error('Fetch service types error:', err);
    }
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleSaveShop = async () => {
    setLoading(true);
    try {
      const shopRequest = {
        name: shopForm.name,
        address: shopForm.address,
        phoneNumber: shopForm.phoneNumber,
      };

      const formData = new FormData();
      formData.append('request', new Blob([JSON.stringify(shopRequest)], { type: 'application/json' }));
      if (shopImage) formData.append('avtFile', shopImage);

      if (shop) {
        await axiosInstance.put(`/shops/${shop.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Shop updated successfully!');
      } else {
        await axiosInstance.post(`/shops`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Shop created successfully!');
      }
      fetchMyShop();
      setShopImage(null);
    } catch (err) {
      setError('Failed to save shop. Please try again.');
      console.error('Save shop error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    if (!shop) {
      setError('You need to create a shop first.');
      return;
    }
    setLoading(true);
    try {
      const serviceRequest = {
        serviceTypeId: serviceForm.serviceTypeId,
      };
      await axiosInstance.post('/services', serviceRequest, {
        headers: { 'Content-Type': 'application/json' },
      });
      alert('Service created successfully!');
      setServiceForm({ serviceTypeId: '' });
      setSelectedServiceType(null);
      fetchMyShop();
    } catch (err) {
      setError('Failed to create service. Please try again.');
      console.error('Create service error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to accept this booking?')) return;
    
    try {
      setBookingsLoading(true);
      const response = await axiosInstance.post(`/bookings/${bookingId}`);
      
      if (response.data.code === 1000) {
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: 'ACCEPT' }
              : booking
          )
        );
        alert(response.data.result);
      } else {
        setError(`Failed to accept booking: ${response.data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept booking. Please try again.');
      console.error('Accept booking error:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleServiceTypeChange = (serviceTypeId: string) => {
    const selectedType = serviceTypes.find((type) => type.id === serviceTypeId) || null;
    setServiceForm({ serviceTypeId });
    setSelectedServiceType(selectedType);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-blue-100 text-blue-700';
      case 'ACCEPT':
        return 'bg-green-100 text-green-700';
      case 'SUCCESS':
        return 'bg-purple-100 text-purple-700';
      case 'CANCEL':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredBookings = bookings.filter(booking => 
    ['CANCEL', 'PAID', 'ACCEPT', 'SUCCESS'].includes(booking.status)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <button
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow-lg p-6">
          <nav className="space-y-4">
            <button
              onClick={() => setActiveTab('shop')}
              className={`block w-full text-left p-2 rounded ${
                activeTab === 'shop' ? 'text-green-600 font-semibold bg-green-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Shop
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`block w-full text-left p-2 rounded ${
                activeTab === 'services'
                  ? 'text-green-600 font-semibold bg-green-50'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              disabled={!shop}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`block w-full text-left p-2 rounded ${
                activeTab === 'bookings'
                  ? 'text-green-600 font-semibold bg-green-50'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              disabled={!shop}
            >
              Bookings
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'shop' && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Shop</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {loading && <p className="text-gray-500 mb-4">Loading...</p>}

                {shopNotExisted && !shop && (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">You don't have a shop yet.</p>
                    <button
                      onClick={() => setShopNotExisted(false)}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                    >
                      Create Shop
                    </button>
                  </div>
                )}

                {!shopNotExisted && (
                  <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold mb-4">{shop ? 'Edit My Shop' : 'Create My Shop'}</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveShop();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-gray-700">Shop Name</label>
                        <input
                          type="text"
                          value={shopForm.name}
                          onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Address</label>
                        <input
                          type="text"
                          value={shopForm.address}
                          onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Phone Number</label>
                        <input
                          type="text"
                          value={shopForm.phoneNumber}
                          onChange={(e) => setShopForm({ ...shopForm, phoneNumber: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Shop Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setShopImage(e.target.files?.[0] || null)}
                          className="w-full p-2 border rounded-lg"
                        />
                        {shop?.avtUrl && (
                          <img
                            src={shop.avtUrl}
                            alt="Shop Avatar"
                            className="mt-2 w-32 h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : shop ? 'Update Shop' : 'Create Shop'}
                        </button>
                        {shop && (
                          <button
                            type="button"
                            onClick={() => setShopForm({ name: '', address: '', phoneNumber: '' })}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}

            {activeTab === 'services' && shop && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Services</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {loading && <p className="text-gray-500 mb-4">Loading...</p>}

                {shop.services && shop.services.length > 0 ? (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700">
                          <th className="p-3">ID</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Price (VND)</th>
                          <th className="p-3">Duration (minutes)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shop.services.map((service) => (
                          <tr key={service.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{service.id}</td>
                            <td className="p-3">{service.name}</td>
                            <td className="p-3">{service.price.toLocaleString()}</td>
                            <td className="p-3">{service.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 mb-6">No services available yet.</p>
                )}

                <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-inner">
                  <h3 className="text-xl font-semibold mb-4">Add New Service</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCreateService();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-gray-700">Service Type</label>
                      <select
                        value={serviceForm.serviceTypeId}
                        onChange={(e) => handleServiceTypeChange(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select a service type</option>
                        {serviceTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedServiceType && (
                      <>
                        <div>
                          <label className="block text-gray-700">Price (VND)</label>
                          <input
                            type="number"
                            value={selectedServiceType.price}
                            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-600"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700">Duration (minutes)</label>
                          <input
                            type="number"
                            value={selectedServiceType.duration}
                            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-600"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700">Description</label>
                          <textarea
                            value={selectedServiceType.description}
                            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-600"
                            rows={3}
                            readOnly
                          />
                        </div>
                      </>
                    )}
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Service'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setServiceForm({ serviceTypeId: '' });
                          setSelectedServiceType(null);
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
            
            {activeTab === 'bookings' && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Bookings</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {bookingsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500"></div>
                  </div>
                ) : filteredBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pet Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img 
                                    className="h-10 w-10 rounded-full object-cover" 
                                    src={booking.serviceTypeResponse.avtUrl || "https://via.placeholder.com/40"} 
                                    alt={booking.serviceTypeResponse.name} 
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.serviceTypeResponse.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {booking.serviceTypeResponse.price.toLocaleString()} VND
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img 
                                    className="h-10 w-10 rounded-full object-cover" 
                                    src={booking.pet.avtUrl || "https://via.placeholder.com/40"} 
                                    alt={booking.pet.name} 
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.pet.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {booking.pet.species} - {booking.pet.weight} kg
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking.user.numberPhone || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.user.address}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDateTime(booking.bookingTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {booking.status === 'PAID' && (
                                <button 
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mr-2"
                                  onClick={() => handleAcceptBooking(booking.id)}
                                  disabled={bookingsLoading}
                                >
                                  {bookingsLoading ? 'Accepting...' : 'Accept'}
                                </button>
                              )}
                              {booking.status === 'ACCEPT' && (
                                <button 
                                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
                                  onClick={() => {
                                    alert(`Complete booking ${booking.id}`);
                                  }}
                                >
                                  Complete
                                </button>
                              )}
                              {booking.status === 'SUCCESS' && (
                                <span className="text-green-600 font-semibold">
                                  Completed ✓
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bookings available.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>© 2025 Owner Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OwnerPage;