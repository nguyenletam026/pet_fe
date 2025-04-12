import { useEffect, useState } from "react";
import axios from "axios";
import { FaEnvelope, FaMapMarkerAlt, FaCalendar, FaUserShield, FaPaw, FaPlus, FaTimes, FaDog, FaCat, FaWeight, FaPaw as FaAge, FaEdit, FaTrash, FaInfoCircle, FaShoppingCart } from "react-icons/fa";
import Header from "./Header";
import { API_URL } from '../../Base_Api';
import { Link } from 'react-router-dom';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  avtUrl?: string;
}

interface Booking {
  id: string;
  shopName: string;
  serviceTypeResponse: {
    id: string | null;
    name: string;
    price: number;
    duration: number;
    description: string | null;
    avtUrl: string | null;
  };
  bookingTime: string;
  status: string;
  pet: {
    id: string | null;
    name: string;
    species: string | null;
    breed: string | null;
    age: number;
    weight: number;
    avtUrl: string | null;
  };
  totalPrice: number;
}

interface BookingResponse {
  code: number;
  result: Booking[];
}

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "pets">("profile");
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
  });
  const [petImage, setPetImage] = useState<File | null>(null);
  const [selectedPetBookings, setSelectedPetBookings] = useState<Booking[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          setError("Bạn chưa đăng nhập!");
          setLoading(false);
          return;
        }

        const userResponse = await axiosInstance.get('/users/myInfo');
        setUserData(userResponse.data.result);

        const petsResponse = await axiosInstance.get('/pets');
        if (petsResponse.data.code === 1000 && Array.isArray(petsResponse.data.result)) {
          setPets(petsResponse.data.result);
        } else {
          setPets([]);
        }
      } catch (err) {
        console.error("Lỗi fetch data:", err);
        setError("Không thể lấy thông tin!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    const petRequest = {
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed,
      age: parseInt(newPet.age),
      weight: parseFloat(newPet.weight),
    };

    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(petRequest)], { type: "application/json" }));
    if (petImage) formData.append("avtFile", petImage);

    try {
      const response = await axiosInstance.post('/pets', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.code === 1000) {
        alert("Thêm Pet thành công!");
        setPets([...pets, response.data.result]);
        setShowAddPetForm(false);
        setNewPet({ name: "", species: "", breed: "", age: "", weight: "" });
        setPetImage(null);
      } else {
        alert("Thêm Pet thất bại!");
      }
    } catch (error) {
      console.error("Lỗi thêm Pet:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPet({ ...newPet, [e.target.name]: e.target.value });
  };

  const handleDeletePet = async (petId: string) => {
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa Pet này?")) return;

    try {
      const response = await axiosInstance.delete(`/pets/${petId}`);
      if (response.data.code === 1000) {
        alert("Xóa Pet thành công!");
        setPets(pets.filter((pet) => pet.id !== petId));
      } else {
        alert("Xóa Pet thất bại!");
      }
    } catch (error) {
      console.error("Lỗi xóa Pet:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleEditPet = () => {
    alert("Chức năng chỉnh sửa đang được phát triển!");
  };

  const handleViewBookings = async (petId: string) => {
    setBookingLoading(true);
    setBookingError("");
    setShowBookingModal(true);

    try {
      const response = await axiosInstance.get<BookingResponse>(`/pets/pet/${petId}`);
      if (response.data.code === 1000 && Array.isArray(response.data.result)) {
        setSelectedPetBookings(response.data.result);
      } else {
        setSelectedPetBookings([]);
        setBookingError("Không tìm thấy lịch sử đặt lịch.");
      }
    } catch (error) {
      console.error("Lỗi fetch bookings:", error);
      setBookingError("Không thể lấy lịch sử đặt lịch!");
      setSelectedPetBookings([]);
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 text-lg font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-yellow-600 hover:text-yellow-800 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative text-center">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg">
                    <img
                      src={userData?.avtUrl || "https://via.placeholder.com/150"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {userData?.firstName} {userData?.lastName}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Thành viên tích cực</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaEnvelope className="text-yellow-500" size={20} />
                    <span>{userData?.username}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaCalendar className="text-yellow-500" size={20} />
                    <span>{new Date(userData?.birthdayDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaMapMarkerAlt className="text-yellow-500" size={20} />
                    <span>{userData?.address || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaUserShield className="text-yellow-500" size={20} />
                    <span>{userData?.role?.name}</span>
                  </div>
                </div>
                <button className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-md">
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-8">
            <div className="flex space-x-4 mb-8 border-b border-gray-200">
              <button
                className={`px-6 py-3 font-semibold rounded-t-lg transition-colors duration-300 ${
                  activeTab === "profile"
                    ? "bg-yellow-500 text-white border-b-4 border-yellow-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Hồ sơ cá nhân
              </button>
              <button
                className={`px-6 py-3 font-semibold rounded-t-lg transition-colors duration-300 ${
                  activeTab === "pets"
                    ? "bg-yellow-500 text-white border-b-4 border-yellow-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("pets")}
              >
                Danh sách Pet <FaPaw className="inline ml-2" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 text-lg font-medium">{error}</p>
              </div>
            ) : (
              <>
                {activeTab === "profile" && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
                    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Giới thiệu</h3>
                      <p className="text-gray-600">
                        {userData?.bio || "Chưa có thông tin giới thiệu. Hãy cập nhật hồ sơ của bạn!"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông tin chi tiết</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-800 font-medium">{userData?.username}</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Ngày sinh</p>
                          <p className="text-gray-800 font-medium">
                            {new Date(userData?.birthdayDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Địa chỉ</p>
                          <p className="text-gray-800 font-medium">{userData?.address || "Chưa cập nhật"}</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Vai trò</p>
                          <p className="text-gray-800 font-medium">{userData?.role?.name}</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Số điện thoại</p>
                          <p className="text-gray-800 font-medium">{userData?.numberPhone || "Chưa cập nhật"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "pets" && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-gray-900">Danh sách Pet</h2>
                    {pets.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pets.map((pet, index) => (
                          <div
                            key={index}
                            className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                          >
                            {/* Pet Image */}
                            <div className="relative w-full h-48">
                              <img
                                src={pet?.avtUrl || "https://via.placeholder.com/300"}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                  onClick={() => handleViewBookings(pet.id)}
                                  className="text-white font-semibold bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg transition-all duration-300"
                                >
                                  <FaInfoCircle className="inline mr-2" /> Xem chi tiết
                                </button>
                              </div>
                            </div>

                            {/* Pet Info */}
                            <div className="p-5 space-y-2">
                              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                {pet.name}
                                {pet.species.toLowerCase() === "dog" ? (
                                  <FaDog className="text-yellow-500" />
                                ) : (
                                  <FaCat className="text-yellow-500" />
                                )}
                              </h3>
                              <div className="space-y-1 text-gray-600">
                                <p className="flex items-center gap-2">
                                  <FaPaw className="text-yellow-500" /> Loài: {pet.species}
                                </p>
                                <p className="flex items-center gap-2">
                                  <FaPaw className="text-yellow-500" /> Giống: {pet.breed}
                                </p>
                                <p className="flex items-center gap-2">
                                  <FaWeight className="text-yellow-500" /> Cân nặng: {pet.weight} kg
                                </p>
                                <p className="flex items-center gap-2">
                                  <FaAge className="text-yellow-500" /> Tuổi: {pet.age}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 flex justify-between border-t border-gray-200 bg-gray-50">
                              <button
                                onClick={handleEditPet}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <FaEdit /> Chỉnh sửa
                              </button>
                              <button
                                onClick={() => handleDeletePet(pet.id)}
                                className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
                              >
                                <FaTrash /> Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : showAddPetForm ? (
                      <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Thêm Pet mới</h3>
                        <form onSubmit={handleAddPet} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Tên Pet</label>
                              <input
                                type="text"
                                name="name"
                                value={newPet.name}
                                onChange={handleInputChange}
                                className="mt-1 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Loài</label>
                              <input
                                type="text"
                                name="species"
                                value={newPet.species}
                                onChange={handleInputChange}
                                className="mt-1 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Giống</label>
                              <input
                                type="text"
                                name="breed"
                                value={newPet.breed}
                                onChange={handleInputChange}
                                className="mt-1 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Tuổi</label>
                              <input
                                type="number"
                                name="age"
                                value={newPet.age}
                                onChange={handleInputChange}
                                className="mt-1 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Cân nặng (kg)</label>
                              <input
                                type="number"
                                name="weight"
                                value={newPet.weight}
                                onChange={handleInputChange}
                                className="mt-1 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Ảnh Pet</label>
                              <input
                                type="file"
                                onChange={(e) => setPetImage(e.target.files?.[0] || null)}
                                className="mt-1 p-3 w-full border rounded-lg"
                                accept="image/*"
                              />
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <button
                              type="submit"
                              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md"
                            >
                              <FaPlus /> Thêm Pet
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddPetForm(false)}
                              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md"
                            >
                              <FaTimes /> Hủy
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">Không có pet nào để hiển thị.</p>
                        <button
                          onClick={() => setShowAddPetForm(true)}
                          className="flex items-center gap-2 mx-auto bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md"
                        >
                          <FaPlus /> Thêm Pet
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative transform transition-all duration-300 scale-95 hover:scale-100">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaTimes size={24} />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Lịch sử đặt lịch</h3>

            {bookingLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-yellow-500"></div>
              </div>
            ) : bookingError ? (
              <div className="text-center py-4">
                <p className="text-red-600 text-lg font-medium">{bookingError}</p>
              </div>
            ) : selectedPetBookings.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedPetBookings[0]?.pet.avtUrl || "https://via.placeholder.com/80"}
                    alt={selectedPetBookings[0]?.pet.name}
                    className="w-20 h-20 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">{selectedPetBookings[0]?.pet.name}</h4>
                    <p className="text-gray-600">Lịch sử đặt lịch</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedPetBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <p className="text-gray-800 font-medium">{booking.serviceTypeResponse.name}</p>
                        <p className="text-gray-600 text-sm">{formatDateTime(booking.bookingTime)}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        THÀNH CÔNG
                      </span>

                    </div>
                    
                  ))}
                </div>
                <div> Chăm sóc cho Pet ngay</div>
                <Link to="/services" className="relative flex items-center text-black hover:text-gray-600 transition-colors">
            <FaShoppingCart className="text-lg text-black" size={16} />
            <span className="ml-1 text-base font-medium"></span>
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              
            </span>
          </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">Không có lịch sử đặt lịch cho Pet này.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;