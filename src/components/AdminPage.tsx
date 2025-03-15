import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import Modal from 'react-modal';

// Service type interface
interface ServiceType {
  id: string;
  name: string;
  description?: string;
  avtUrl?: string;
}

// User interfaces
interface UserResponse {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthdayDate: string;
  numberPhone: string;
  role: { name: string };
  avtUrl: string;
  address: string;
  email?: string;
}

interface UpdateForm {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  numberPhone: string;
  address: string;
}

const AdminPage = () => {
  // Existing states
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    username: '', email: '', firstName: '', lastName: '', numberPhone: '', address: ''
  });

  // Service states
  const [services, setServices] = useState<ServiceType[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'services'>('users');
  const [serviceForm, setServiceForm] = useState({ name: '', description: '' });
  const [serviceFile, setServiceFile] = useState<File | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newManager, setNewManager] = useState<{ username: string; password: string } | null>(null);

  const token = localStorage.getItem('token');
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAllUsers();
    } else {
      fetchAllServices();
    }
  }, [activeTab]);

  // Existing user functions
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users');
      setUsers(Array.isArray(response.data.result) ? response.data.result : []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserById = async (userId: string) => {
    // ... (keep existing implementation)
  };

  const handleUpdateUser = async (userId: string) => {
    // ... (keep existing implementation)
  };

  const handleDeleteUser = async (userId: string) => {
    // ... (keep existing implementation)
  };

  const handleCreateManager = async () => {
    // ... (keep existing implementation)
  };

  // Service functions
  const fetchAllServices = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/service-types');
      setServices(Array.isArray(response.data.result) ? response.data.result : []);
    } catch (err) {
      setError('Failed to fetch services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      // Use Blob for JSON data
      formData.append(
        "request",
        new Blob([JSON.stringify(serviceForm)], { type: "application/json" })
      );
      if (serviceFile) {
        formData.append('avtFile', serviceFile);
      }

      const response = await axiosInstance.post('/service-types', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setServiceForm({ name: '', description: '' });
      setServiceFile(null);
      fetchAllServices();
      alert('Service created successfully!');
    } catch (err) {
      setError('Failed to create service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/service-types/${serviceId}`);
        fetchAllServices();
        alert('Service deleted successfully!');
      } catch (err) {
        setError('Failed to delete service');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg" onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}>
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow-lg p-6">
          <nav className="space-y-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`block w-full text-left p-2 rounded ${
                activeTab === 'users' ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`block w-full text-left p-2 rounded ${
                activeTab === 'services' ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Manage Service
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'users' ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Users</h2>
                <button
                  onClick={handleCreateManager}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-green-600"
                >
                  Create Shop Owner
                </button>
                {users.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      {/* ... (keep existing table structure) */}
                    </table>
                  </div>
                )}
                {selectedUser && (
                  <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-inner">
                    {/* ... (keep existing update form) */}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Services</h2>
                
                <form onSubmit={handleCreateService} className="mb-6 bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700">Service Name</label>
                      <input
                        type="text"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Description</label>
                      <input
                        type="text"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Image</label>
                      <input
                        type="file"
                        onChange={(e) => setServiceFile(e.target.files?.[0] || null)}
                        className="w-full p-2"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Service'}
                  </button>
                </form>

                {services.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700">
                          <th className="p-3">ID</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Image</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service) => (
                          <tr key={service.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{service.id}</td>
                            <td className="p-3">{service.name}</td>
                            <td className="p-3">{service.description || 'N/A'}</td>
                            <td className="p-3">
                              {service.avtUrl ? (
                                <img src={service.avtUrl} alt={service.name} className="w-12 h-12 object-cover" />
                              ) : 'N/A'}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleDeleteService(service.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No services found.</p>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>© 2025 Admin Dashboard. All rights reserved.</p>
      </footer>

      {newManager && (
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          contentLabel="New Manager Details"
          className="modal"
          overlayClassName="modal-overlay"
        >
          {/* ... (keep existing modal) */}
        </Modal>
      )}
    </div>
  );
};

export default AdminPage;