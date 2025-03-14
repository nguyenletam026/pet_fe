import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopNotExisted, setShopNotExisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'services'>('shop');

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

  // Fetch my shop
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

  // Fetch service types
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

  // Create or Update shop
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

  // Create service
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
      fetchMyShop(); // Refresh shop data to update services list
    } catch (err) {
      setError('Failed to create service. Please try again.');
      console.error('Create service error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle service type selection
  const handleServiceTypeChange = (serviceTypeId: string) => {
    const selectedType = serviceTypes.find((type) => type.id === serviceTypeId) || null;
    setServiceForm({ serviceTypeId });
    setSelectedServiceType(selectedType);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <button
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'shop' && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Shop</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {loading && <p className="text-gray-500 mb-4">Loading...</p>}

                {/* Shop Not Existed */}
                {shopNotExisted && !shop && (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">You don’t have a shop yet.</p>
                    <button
                      onClick={() => setShopNotExisted(false)}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                    >
                      Create Shop
                    </button>
                  </div>
                )}

                {/* Shop Details or Form */}
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

                {/* Services List */}
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

                {/* Create Service Form */}
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
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>© 2025 Owner Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OwnerPage;