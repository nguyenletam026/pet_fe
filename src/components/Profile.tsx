import { useEffect, useState } from "react";
import axios from "axios";
import { FaEnvelope, FaMapMarkerAlt, FaCalendar, FaUserShield, FaPaw, FaPlus, FaTimes, FaDog, FaCat, FaWeight, FaPaw as FaAge, FaEdit, FaTrash } from "react-icons/fa";
import Navbar from "./Navbar";
import Header from "./Header";
const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
  });
  const [petImage, setPetImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Bạn chưa đăng nhập!");
          setLoading(false);
          return;
        }

        const userResponse = await axios.get("http://localhost:8080/users/myInfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(userResponse.data.result);

        const petsResponse = await axios.get("http://localhost:8080/pets", {
          headers: { Authorization: `Bearer ${token}` },
        });

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
  }, []);

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
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
      const response = await axios.post("http://localhost:8080/pets", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
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
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa Pet này?")) return;

    try {
      const response = await axios.delete(`http://localhost:8080/pets/${petId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const handleEditPet = (pet: any) => {
    alert("Chức năng chỉnh sửa đang được phát triển!");
  };

  return (
    <div>
      <Header/>
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 w-screen">
      <div className="flex w-full bg-white rounded-lg shadow-lg h-full">
        <div className="w-80 p-6 border-r border-gray-200">
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
              <div className="relative">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg">
                  <img
                    src={userData?.avtUrl || "https://via.placeholder.com/150"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userData?.firstName} {userData?.lastName}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Thành viên tích cực</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaEnvelope className="text-yellow-500" size={20} />
                  <span>{userData?.username}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaCalendar className="text-yellow-500" size={20} />
                  <span>{new Date(userData?.birthdayDate).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaMapMarkerAlt className="text-yellow-500" size={20} />
                  <span>{userData?.address || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUserShield className="text-yellow-500" size={20} />
                  <span>{userData?.role?.name}</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all duration-300">
                Chỉnh sửa hồ sơ
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 bg-gray-50 p-8">
          <div className="w-full mx-auto">
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 font-semibold rounded-lg ${activeTab === "profile" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700"} hover:bg-yellow-600 hover:text-white transition-colors`}
                onClick={() => setActiveTab("profile")}
              >
                Hồ sơ cá nhân
              </button>
              <button
                className={`px-4 py-2 font-semibold rounded-lg ${activeTab === "pets" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700"} hover:bg-yellow-600 hover:text-white transition-colors`}
                onClick={() => setActiveTab("pets")}
              >
                Danh sách Pet <FaPaw className="inline ml-1" />
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
                  <div className="bg-white shadow-xl rounded-xl p-6 space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Hồ sơ cá nhân</h2>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Giới thiệu</h3>
                      <p className="text-gray-600">
                        {userData?.bio || "Chưa có thông tin giới thiệu. Hãy cập nhật hồ sơ của bạn!"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Thông tin chi tiết</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-800 font-medium">{userData?.username}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Ngày sinh</p>
                          <p className="text-gray-800 font-medium">
                            {new Date(userData?.birthdayDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Địa chỉ</p>
                          <p className="text-gray-800 font-medium">
                            {userData?.address || "Chưa cập nhật"}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Vai trò</p>
                          <p className="text-gray-800 font-medium">{userData?.role?.name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Số điện thoại</p>
                          <p className="text-gray-800 font-medium">{userData?.numberPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

{activeTab === "pets" && (
  <div className="bg-white shadow-xl rounded-xl p-6 space-y-6">
    <h2 className="text-3xl font-bold text-gray-900 mb-6">Danh sách Pet</h2>
    {pets.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet, index) => (
          <div
            key={index}
            className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            {/* Hình ảnh Pet với điều chỉnh để full */}
            <div className="relative w-full" style={{ paddingTop: "75%" }}> {/* Tỷ lệ 4:3 */}
              <img
                src={pet?.avtUrl || "https://via.placeholder.com/300"}
                alt={pet.name}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <p className="text-white font-semibold">Xem chi tiết</p>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {pet.name}
                {pet.species.toLowerCase() === "dog" ? (
                  <FaDog className="text-yellow-500" />
                ) : (
                  <FaCat className="text-yellow-500" />
                )}
              </h3>
              <div className="space-y-1">
                <p className="text-gray-600 flex items-center gap-2">
                  <FaPaw className="text-yellow-500" /> Loài: {pet.species}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <FaPaw className="text-yellow-500" /> Giống: {pet.breed}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <FaWeight className="text-yellow-500" /> Cân nặng: {pet.weight} kg
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <FaAge className="text-yellow-500" /> Tuổi: {pet.age}
                </p>
              </div>
            </div>

            <div className="p-4 flex justify-between border-t border-gray-200">
              <button
                onClick={() => handleEditPet(pet)}
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
      <div className="relative">
        <form onSubmit={handleAddPet} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên Pet</label>
              <input
                type="text"
                name="name"
                value={newPet.name}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ảnh Pet</label>
              <input
                type="file"
                onChange={(e) => setPetImage(e.target.files?.[0] || null)}
                className="mt-1 p-2 w-full border rounded-lg"
                accept="image/*"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
            >
              <FaPlus /> Thêm Pet
            </button>
            <button
              type="button"
              onClick={() => setShowAddPetForm(false)}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              <FaTimes /> Hủy
            </button>
          </div>
        </form>
      </div>
    ) : (
      <div className="text-center">
        <p className="text-gray-600 mb-4">Không có pet nào để hiển thị.</p>
        <button
          onClick={() => setShowAddPetForm(true)}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
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
    </div>
  </div>
    );
};
export default Profile;