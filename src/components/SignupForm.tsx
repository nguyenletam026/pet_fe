import { useState } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaUpload,FaPhone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/attachment_102284279.jpg";

const SignupForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [numberPhone, setNumberphone] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Xử lý khi chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
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

    // Chuẩn bị JSON request
    const userRequest = {
      username: email,
      password: password,
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ").slice(1).join(" "),
      address: address,
      numberPhone: "0123456789",
      birthdayDate: "2000-01-01T00:00:00Z",
    };

    // Tạo FormData
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(userRequest)], { type: "application/json" }));
    if (avatar) formData.append("avtFile", avatar);

    try {
      const response = await axios.post("http://localhost:8080/users", formData, {
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
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Số điện thoại"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                value={numberPhone}
                onChange={(e) => setNumberphone(e.target.value)}
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
            {previewAvatar && <img src={previewAvatar} alt="Avatar" className="w-20 h-20 rounded-full mt-2" />}

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
        </div>
      </div>

      {/* Phần phải - Hình ảnh minh họa */}
      <div className="hidden md:flex w-1/2 bg-gray-100 p-6 rounded-lg">
        <img src={loginImage} alt="PetStore Illustration" className="w-full h-full object-cover rounded-lg" />
      </div>
    </div>
  );
};

export default SignupForm;
