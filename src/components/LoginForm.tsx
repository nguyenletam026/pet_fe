import { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../Base_Api';
// Custom JWT payload interface
interface CustomJwtPayload {
  scope?: string;
  sub?: string;
  exp?: number;
  iat?: number;
}

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/token`, {
        username,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      const token = response.data.result.token;
      localStorage.setItem('token', token);

      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      if (decodedToken.scope === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if(decodedToken.scope === 'ROLE_OWNER') {
        navigate('/owner');
      }
      else {
        navigate('/profile');
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithGoogle = () => {
    alert('Đăng nhập bằng Google đang được phát triển!');
  };

  return (
    <div className="flex h-screen ">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-green-700">
            PetStore ✨
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Chăm sóc thú cưng, mang lại hạnh phúc – Hành trình yêu thương bắt đầu từ đây!
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative">
              <input
                placeholder="Nhập email của bạn"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* OR Separator */}
          <div className="my-4 flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">HOẶC</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleContinueWithGoogle}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-black p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500" />
            Đăng nhập bằng Google
          </button>

          {/* Signup Link */}
          <p className="text-center text-gray-500 mt-4">
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="text-yellow-600 hover:underline">
              Đăng ký ngay 🐾
            </Link>
          </p>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex w-1/2 bg-gray-100 p-6 rounded-lg">
        <div className="relative w-full h-full">
          <img
            src='https://marketplace.canva.com/EAFJ1a_Jkq4/1/0/1600w/canva-brown-black-simple-modern-pet-shop-logo-3HtOB_YFCeQ.jpg'
            alt="PetStore Illustration"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-lg font-semibold" style={{ color: 'black' }}>
              "PetStore đã thay đổi cách tôi chăm sóc thú cưng của mình. Nhờ hướng dẫn tuyệt vời, tôi cảm thấy tự tin hơn bao giờ hết!"
            </p>
            <p className="mt-2 text-sm">Nguyễn Văn A</p>
            <p className="text-sm opacity-75">Chủ nhân của chú mèo Mướp</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;