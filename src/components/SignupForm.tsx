import { useState } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaUpload, FaPhone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/attachment_102284279.jpg";
import { API_URL } from '../../Base_Api';
const SignupForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [numberPhone, setNumberPhone] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const navigate = useNavigate();

  // Xử lý khi chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  // Gọi API Goong Autocomplete
  const fetchAddressSuggestions = async (input: string) => {
    if (!input) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://rsapi.goong.io/Place/AutoComplete?api_key=Vdl76qC064CJ5q05tJfCqrSW51c8FWnh5uGIAPVa&location=21.013715429594125,105.79829597455202&input=${encodeURIComponent(input)}`
      );
      setAddressSuggestions(response.data.predictions || []);
    } catch (err) {
      console.error("Error fetching address suggestions:", err);
    }
  };

  // Xử lý khi người dùng nhập địa chỉ
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    fetchAddressSuggestions(value);
  };

  // Xử lý khi người dùng chọn một gợi ý
  const handleAddressSelect = (suggestion: any) => {
    setAddress(suggestion.description);
    setAddressSuggestions([]);
  };

  // Lấy địa chỉ tự động từ tọa độ
  const fetchAddressFromCoords = async () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt của bạn không hỗ trợ lấy vị trí!");
      return;
    }
  
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLon(longitude);
  
        try {
          const response = await axios.get(
            `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=Vdl76qC064CJ5q05tJfCqrSW51c8FWnh5uGIAPVa`
          );
  
          const addressResult = response.data.results[0]?.formatted_address;
          if (addressResult) {
            setAddress(addressResult);
            setAddressSuggestions([]); // Xóa gợi ý nếu có
          } else {
            setError("Không thể lấy địa chỉ từ tọa độ!");
          }
        } catch (err) {
          setError("Lỗi khi lấy địa chỉ tự động!");
          console.error("Error fetching address from coords:", err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Không thể lấy vị trí của bạn. Vui lòng cấp quyền truy cập vị trí!");
        setLoading(false);
        console.error("Geolocation error:", err);
      }
    );
  };
  

  // Xử lý submit form đăng ký
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      setLoading(false);
      return;
    }

    const userRequest = {
      username: email,
      password: password,
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ").slice(1).join(" "),
      address: address,
      numberPhone: numberPhone || "0123456789",
      birthdayDate: "2000-01-01T00:00:00Z",
    };

    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(userRequest)], { type: "application/json" }));
    if (avatar) formData.append("avtFile", avatar);

    try {
      const response = await axios.post(`${API_URL}/users`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.code === 1000) {
        alert("Đăng ký thành công!");
        navigate("/login");
      } else {
        setError("Đăng ký thất bại. Hãy thử lại!");
      }
    } catch (err) {
      setError("Lỗi hệ thống. Vui lòng thử lại sau!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Phần trái - Form đăng ký */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-green-700">
            Đăng Ký PetStore ✨
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Chăm sóc thú cưng, mang lại hạnh phúc – Hành trình yêu thương bắt đầu từ đây!
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="relative">
              <input
                type="text"
                placeholder="Họ và Tên"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Address */}
            <div className="relative">
              <input
                type="text"
                placeholder="Địa chỉ"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                value={address}
                onChange={handleAddressChange}
                required
              />
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {/* Nút lấy địa chỉ tự động */}
              <button
                type="button"
                onClick={fetchAddressFromCoords}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600"
              >
                Lấy tự động
              </button>
              {/* Danh sách gợi ý */}
              {addressSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto">
                  {addressSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleAddressSelect(suggestion)}
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Phone */}
            <div className="relative">
              <input
                type="text"
                placeholder="Số điện thoại"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                value={numberPhone}
                onChange={(e) => setNumberPhone(e.target.value)}
                required
              />
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Upload Avatar */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="avatarUpload"
                onChange={handleFileChange}
              />
              <label
                htmlFor="avatarUpload"
                className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center bg-white hover:bg-gray-100 transition"
              >
                <FaUpload className="mr-2 text-gray-400" />
                <span>Chọn ảnh đại diện</span>
              </label>
            </div>

            {/* Hiển thị ảnh preview */}
            {previewAvatar && (
              <img src={previewAvatar} alt="Avatar" className="w-20 h-20 rounded-full mt-2" />
            )}

            {/* Đăng ký button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4">
            Đã có tài khoản?{" "}
            <a href="/" className="text-yellow-600 hover:underline">
              Đăng nhập ngay!
            </a>
          </p>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>

      {/* Phần phải - Hình ảnh minh họa */}
      <div className="hidden md:flex w-1/2 bg-gray-100 p-6 rounded-lg">
        <img src='https://marketplace.canva.com/EAFJ1a_Jkq4/1/0/1600w/canva-brown-black-simple-modern-pet-shop-logo-3HtOB_YFCeQ.jpg' alt="PetStore Illustration" className="w-full h-full object-cover rounded-lg" />
      </div>
    </div>
  );
};

export default SignupForm;