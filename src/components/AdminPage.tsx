import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import Modal from 'react-modal';

// Service type interface
interface ServiceType {
  id: string;
  name: string;
  price: number;
  duration: number;
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
  // User states
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    numberPhone: '',
    address: '',
  });

  // Service states
  const [services, setServices] = useState<ServiceType[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'services'>('users');
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: 0,
    duration: 0,
    description: ''
  });
  const [serviceFile, setServiceFile] = useState<File | null>(null);

  // General states
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

  // User management functions
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users');
      const usersData = Array.isArray(response.data.result) ? response.data.result : [];
      setUsers(usersData);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserById = async (userId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      const userData = response.data.result;
      setSelectedUser(userData);
      setUpdateForm({
        username: userData.username || '',
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        numberPhone: userData.numberPhone || '',
        address: userData.address || '',
      });
    } catch (err) {
      setError('Failed to fetch user details. Please try again.');
      console.error('Fetch user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/users/${userId}`, updateForm);
      alert('User updated successfully!');
      fetchAllUsers();
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to update user. Please try again.');
      console.error('Update user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/users/${userId}`);
        alert('User deleted successfully!');
        fetchAllUsers();
        setSelectedUser(null);
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error('Delete user error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateManager = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/users/create-owner');
      const managerData = response.data.result;
      setNewManager({ username: managerData.username, password: "123456" });
      setShowModal(true);
    } catch (err) {
      setError('Failed to create manager. Please try again.');
      console.error('Create manager error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Service management functions
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
      
      setServiceForm({ name: '', price: 0, duration: 0, description: '' });
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
      {/* Header */}
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

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading && <p className="text-gray-500 mb-4">Loading...</p>}

            {activeTab === 'users' ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Users</h2>
                <button
                  onClick={handleCreateManager}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-green-600"
                >
                  Create Shop Owner
                </button>

                {/* Users Table */}
                {users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700">
                          <th className="p-3">ID</th>
                          <th className="p-3">Username</th>
                          <th className="p-3">Full Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Address</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{user.id}</td>
                            <td className="p-3">{user.username}</td>
                            <td className="p-3">{`${user.firstName} ${user.lastName}`}</td>
                            <td className="p-3">{user.email || 'N/A'}</td>
                            <td className="p-3">{user.numberPhone || 'N/A'}</td>
                            <td className="p-3">{user.address || 'N/A'}</td>
                            <td className="p-3">{user.role?.name || 'N/A'}</td>
                            <td className="p-3 flex gap-2">
                              <button
                                onClick={() => fetchUserById(user.id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
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
                  <p className="text-gray-500">No users found.</p>
                )}

                {/* Update Form */}
                {selectedUser && (
                  <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold mb-4">Edit User</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateUser(selectedUser.id);
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-gray-700">Username</label>
                        <input
                          type="text"
                          value={updateForm.username}
                          onChange={(e) => setUpdateForm({ ...updateForm, username: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Email</label>
                        <input
                          type="email"
                          value={updateForm.email}
                          onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">First Name</label>
                        <input
                          type="text"
                          value={updateForm.firstName}
                          onChange={(e) => setUpdateForm({ ...updateForm, firstName: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Last Name</label>
                        <input
                          type="text"
                          value={updateForm.lastName}
                          onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Phone</label>
                        <input
                          type="text"
                          value={updateForm.numberPhone}
                          onChange={(e) => setUpdateForm({ ...updateForm, numberPhone: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">Address</label>
                        <input
                          type="text"
                          value={updateForm.address}
                          onChange={(e) => setUpdateForm({ ...updateForm, address: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2 flex gap-4 mt-4">
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : 'Update User'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Services</h2>
                
                {/* Service Creation Form */}
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
                      <label className="block text-gray-700">Price</label>
                      <input
                        type="number"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })}
                        className="w-full p-2 border rounded-lg"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Duration (minutes)</label>
                      <input
                        type="number"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded-lg"
                        required
                        min="0"
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

                {/* Services Table */}
                {services.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700">
                          <th className="p-3">ID</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Duration</th>
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
                            <td className="p-3">${service.price.toFixed(2)}</td>
                            <td className="p-3">{service.duration} min</td>
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>© 2025 Admin Dashboard. All rights reserved.</p>
      </footer>

      {/* Modal for new manager details */}
      {newManager && (
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          contentLabel="New Manager Details"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">New Manager Created</h2>
            <p className="mb-2"><strong>Username:</strong> {newManager.username}</p>
            <p className="mb-4"><strong>Password:</strong> {newManager.password}</p>
            <p className="text-red-500">Please change your password after logging in.</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPage;