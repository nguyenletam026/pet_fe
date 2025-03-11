import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
// Define the UserResponse interface based on your backend response
interface UserResponse {
  id: string;
  username: string;
  email: string;
  // Add other fields if they exist in your backend response
}

// Define the Update Form interface
interface UpdateForm {
  username: string;
  email: string;
}

const AdminPage = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateForm>({ username: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the token from localStorage
  const token = localStorage.getItem('token');

  // Axios instance with Authorization header
  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Fetch all users
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_URL}/users`);
      setUsers(response.data.result);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a user by ID
  const fetchUserById = async (userId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_URL}/users/${userId}`);
      setSelectedUser(response.data.result);
      setUpdateForm({
        username: response.data.result.username || '',
        email: response.data.result.email || '',
      });
    } catch (err) {
      setError('Failed to fetch user details. Please try again.');
      console.error('Fetch user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update a user
  const handleUpdateUser = async (userId: string) => {
    setLoading(true);
    try {
      await axiosInstance.put(`${API_URL}/users/${userId}`, updateForm);
      alert('User updated successfully!');
      fetchAllUsers(); // Refresh the user list
      setSelectedUser(null); // Clear selected user
    } catch (err) {
      setError('Failed to update user. Please try again.');
      console.error('Update user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        await axiosInstance.delete(`${API_URL}/users/${userId}`);
        alert('User deleted successfully!');
        fetchAllUsers(); // Refresh the user list
        setSelectedUser(null); // Clear selected user
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error('Delete user error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-700">
        Admin Dashboard - Manage Users
      </h1>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      {/* Loading Indicator */}
      {loading && (
        <p className="text-center text-gray-500 mb-4">Loading...</p>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Username</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => fetchUserById(user.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                  >
                    View/Edit
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

      {/* User Details and Update Form */}
      {selectedUser && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Details</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser(selectedUser.id);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={updateForm.username}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, username: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={updateForm.email}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, email: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPage;