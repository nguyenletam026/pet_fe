import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../Base_Api';
import Header from './Header';
import { FaWallet, FaQrcode, FaTimes } from 'react-icons/fa';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  avtUrl?: string;
}

interface BookingRequest {
  serviceTypeId: string;
  shopId: string;
  petId: string;
  bookingTime: string;
  paymentMethod: 'WALLET' | 'QR_CODE';
}

interface BookingResponse {
  id: string;
  shopName: string;
  serviceTypeResponse: {
    id: string;
    name: string;
    price: number;
    duration: number;
    description: string;
    avtUrl: string;
  };
  bookingTime: string;
  status: string;
  pet: Pet;
  totalPrice: number;
  paymentMethod: 'QR_CODE';
}

interface UserInfoResponse {
  code: number;
  result: {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    birthdayDate: string;
    role: {
      name: string;
      permissions: string[];
    };
    address: string;
    avtUrl?: string;
    numberPhone: string | null;
    balance: string;
  };
}

interface WalletTransactionResponse {
  code: number;
  message: string;
  result: string;
}

interface TransactionCheckResponse {
  message: string;
}

interface DetailedBookingResponse {
  code: number;
  result: {
    id: string;
    shopName: string;
    serviceTypeResponse: {
      id: string;
      name: string;
      price: number;
      duration: number;
      description: string;
      avtUrl: string;
    };
    bookingTime: string;
    status: string;
    pet: Pet;
    totalPrice: number;
    paymentMethod: string;
  };
}

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceTypeId, shopId } = location.state || {};

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'QR_CODE'>('WALLET');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [transactionDes, setTransactionDes] = useState<string | null>(null);
  const [detailedBooking, setDetailedBooking] = useState<DetailedBookingResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 phút = 300 giây
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [showRechargePopup, setShowRechargePopup] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number | null>(null);
  const [rechargeQrUrl, setRechargeQrUrl] = useState<string | null>(null);
  const [rechargeDes, setRechargeDes] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<any>(null);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
  });
  const [petImage, setPetImage] = useState<File | null>(null);

  const token = localStorage.getItem('token');
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });

  // Fetch service type
  useEffect(() => {
    const fetchServiceType = async () => {
      try {
        const response = await axiosInstance.get(`/service-types/${serviceTypeId}`);
        setServiceType(response.data.result);
      } catch (err) {
        setError('Không thể tải thông tin dịch vụ. Vui lòng thử lại.');
        console.error('Fetch service type error:', err);
      }
    };

    if (serviceTypeId) {
      fetchServiceType();
    }
  }, [serviceTypeId]);

  // Fetch pets
  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/pets');
        const petsData = response.data.result || [];
        setPets(petsData);
        if (petsData.length > 0) {
          setSelectedPetId(petsData[0].id);
        }
      } catch (err) {
        setError('Không thể tải danh sách thú cưng. Vui lòng thử lại.');
        console.error('Fetch pets error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Fetch user info when wallet payment is selected
  useEffect(() => {
    if (paymentMethod === 'WALLET' && !userInfo) {
      const fetchUserInfo = async () => {
        try {
          const response = await axiosInstance.get<UserInfoResponse>('/users/myInfo');
          setUserInfo(response.data);
        } catch (err) {
          setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
          console.error('Fetch user info error:', err);
        }
      };
      fetchUserInfo();
    }
  }, [paymentMethod, userInfo]);

  // Generate random string for transaction description
  const generateRandomDes = () => {
    return 'THANH TOAN HOA DON PET SERVICE' + ' ' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  // Function to calculate total price based on pet weight
  const calculateTotalPrice = () => {
    if (!serviceType || !selectedPetId) return 0;

    const selectedPet = pets.find((pet) => pet.id === selectedPetId);
    if (!selectedPet) return serviceType.price;

    const weight = selectedPet.weight;
    const basePrice = serviceType.price;

    if (weight < 5) {
      return basePrice;
    } else if (weight >= 5 && weight <= 10) {
      return basePrice * 1.5;
    } else {
      return basePrice * 2;
    }
  };

  const totalPriceBasedOnWeight = calculateTotalPrice();

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedPetId || !bookingTime) {
      setError('Vui lòng chọn thú cưng và thời gian đặt lịch.');
      return;
    }
    const bookingData: BookingRequest = {
      serviceTypeId,
      shopId,
      petId: selectedPetId,
      bookingTime: new Date(bookingTime).toISOString(),
      paymentMethod,
    };

    setLoading(true);
    try {
      const response = await axiosInstance.post('/bookings', bookingData);
      const bookingResult: BookingResponse = response.data.result;
      setBookingId(bookingResult.id);
      setTotalPrice(bookingResult.totalPrice);

      if (paymentMethod === 'WALLET') {
        setShowWalletPopup(true);
      } else if (paymentMethod === 'QR_CODE') {
        const des = generateRandomDes();
        const qrUrl = `https://qr.sepay.vn/img?acc=04128789601&bank=TPBANK&amount=${bookingResult.totalPrice}&des=${des}&download=DOWNLOAD`;
        setQrCodeUrl(qrUrl);
        setTransactionDes(des);
        setSuccess('Vui lòng quét QR code để thanh toán.');
        setTimeLeft(300);
      }
    } catch (err) {
      setError('Đặt lịch thất bại. Vui lòng thử lại.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle wallet payment confirmation
  const handleWalletPayment = async () => {
    if (!bookingId || !userInfo || !totalPrice) return;

    const balance = parseFloat(userInfo.result.balance);
    if (totalPrice > balance) {
      setShowWalletPopup(false);
      setShowRechargePopup(true);
    } else {
      try {
        const response = await axiosInstance.post<WalletTransactionResponse>('/transactions/wallet', null, {
          params: { bookingId },
        });
        if (response.data.code === 1000 && response.data.result === "Payment successful") {
          const detailedResponse = await axiosInstance.get<DetailedBookingResponse>(`/bookings/${bookingId}`);
          setDetailedBooking(detailedResponse.data);
          setSuccess('Thanh toán qua ví thành công! Xem chi tiết đặt lịch.');
          setShowWalletPopup(false);
        } else {
          setError('Thanh toán qua ví thất bại. Vui lòng thử lại.');
        }
      } catch (err) {
        setError('Thanh toán qua ví thất bại. Vui lòng thử lại.');
        console.error('Wallet payment error:', err);
      }
    }
  };

  // Handle recharge initiation
  const handleRecharge = () => {
    if (!rechargeAmount || rechargeAmount <= 0) {
      setError('Vui lòng chọn hoặc nhập số tiền nạp hợp lệ.');
      return;
    }
    const des = generateRandomDes();
    setRechargeDes(des);
    const qrUrl = `https://qr.sepay.vn/img?acc=04128789601&bank=TPBANK&amount=${rechargeAmount}&des=${des}&template=TEMPLATE&download=DOWNLOAD`;
    setRechargeQrUrl(qrUrl);
    setShowRechargePopup(true);
    setTimeLeft(300);
  };

  // Handle add pet
  const handleAddPet = async () => {
    if (!newPet.name || !newPet.species || !newPet.breed || !newPet.age || !newPet.weight) {
      setError("Vui lòng điền đầy đủ thông tin thú cưng.");
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
      const response = await axiosInstance.post("/pets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.code === 1000) {
        alert("Thêm Pet thành công!");
        setPets([...pets, response.data.result]);
        setShowAddPetForm(false);
        setNewPet({ name: "", species: "", breed: "", age: "", weight: "" });
        setPetImage(null);
        if (pets.length === 0) setSelectedPetId(response.data.result.id);
      } else {
        alert("Thêm Pet thất bại!");
      }
    } catch (error) {
      console.error("Lỗi thêm Pet:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  // Check recharge transaction status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (rechargeQrUrl && rechargeDes && rechargeAmount) {
      interval = setInterval(async () => {
        try {
          const response = await axiosInstance.get<WalletTransactionResponse>('/transactions/check_wallet', {
            params: {
              amount: rechargeAmount,
              des: rechargeDes,
            },
          });
          if (response.data.code === 1000 && response.data.result === true) {
            setSuccess('Nạp tiền thành công! Vui lòng kiểm tra lại số dư.');
            setRechargeQrUrl(null);
            setRechargeDes(null);
            setShowRechargePopup(false);
            const userResponse = await axiosInstance.get<UserInfoResponse>('/users/myInfo');
            setUserInfo(userResponse.data);
            clearInterval(interval);
            clearTimeout(timeout);
          }
        } catch (err) {
          console.error('Recharge check error:', err);
          setError('Có lỗi khi kiểm tra trạng thái nạp tiền. Vui lòng thử lại.');
        }
      }, 5000);

      timeout = setTimeout(() => {
        clearInterval(interval);
        if (rechargeQrUrl) {
          setError('Hết thời gian nạp tiền. Vui lòng thử lại.');
          setRechargeQrUrl(null);
          setRechargeDes(null);
        }
      }, 300000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [rechargeQrUrl, rechargeDes, rechargeAmount]);

  // Countdown timer for QR code and recharge
  useEffect(() => {
    if ((qrCodeUrl || rechargeQrUrl) && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && (qrCodeUrl || rechargeQrUrl)) {
      setError('Hết thời gian thanh toán/nạp tiền. Vui lòng thử lại.');
      setQrCodeUrl(null);
      setRechargeQrUrl(null);
    }
  }, [qrCodeUrl, rechargeQrUrl, timeLeft]);

  // Check transaction status for QR code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (qrCodeUrl && bookingId && totalPrice && transactionDes) {
      interval = setInterval(async () => {
        try {
          const response = await axiosInstance.get<TransactionCheckResponse>('/transactions/check', {
            params: {
              amount: totalPrice,
              des: transactionDes,
              bookingId,
            },
          });
          if (response.data.message === 'Transaction success') {
            const detailedResponse = await axiosInstance.get<DetailedBookingResponse>(`/bookings/${bookingId}`);
            setDetailedBooking(detailedResponse.data);
            setSuccess('Thanh toán thành công! Xem chi tiết đặt lịch.');
            setQrCodeUrl(null);
            clearInterval(interval);
            clearTimeout(timeout);
          }
        } catch (err) {
          console.error('Transaction check error:', err);
          setError('Có lỗi khi kiểm tra trạng thái thanh toán. Vui lòng thử lại.');
        }
      }, 5000);

      timeout = setTimeout(() => {
        clearInterval(interval);
        if (qrCodeUrl) {
          setError('Hết thời gian thanh toán. Vui lòng thử lại.');
          setQrCodeUrl(null);
        }
      }, 300000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [qrCodeUrl, bookingId, totalPrice, transactionDes, navigate]);

  // Format booking time
  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Format countdown timer
  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      <main className="flex-1 px-4 py-12">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center drop-shadow-md">
            Đặt Lịch Chăm Sóc Thú Cưng
          </h2>

          {/* Service Type Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Dịch Vụ Được Chọn</h3>
            {loading && <p className="text-gray-500 text-center">Đang tải thông tin dịch vụ...</p>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {serviceType ? (
              <div className="flex items-center space-x-6">
                <img
                  src={serviceType.avtUrl || 'https://via.placeholder.com/80'}
                  alt={serviceType.name}
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-800">{serviceType.name}</p>
                  <p className="text-gray-600">{serviceType.description}</p>
                  <p className="text-gray-600">
                    Giá gốc: {serviceType.price.toLocaleString()} VND
                  </p>
                  <p className="text-gray-600">
                    Giá Ước tính: {totalPriceBasedOnWeight.toLocaleString()} VND{' '}
                    {selectedPetId && pets.length > 0 && (
                      <span className="text-sm text-gray-500">
                        (Dựa trên cân nặng của thú cưng: {pets.find((pet) => pet.id === selectedPetId)?.weight}kg)
                      </span>
                    )}
                  </p>
                  <p className="text-gray-600">
                    Thời gian: {serviceType.duration} phút
                  </p>
                </div>
              </div>
            ) : (
              !loading && <p className="text-gray-500 text-center">Không có thông tin dịch vụ.</p>
            )}
          </div>

          {/* Pet Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">Chọn Thú Cưng</h3>
              <button
                onClick={() => setShowAddPetForm(true)}
                className="bg-gradient-to-r from-green-400 to-teal-400 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:from-green-500 hover:to-teal-500 transition-all duration-300"
              >
                + Thêm Pet
              </button>
            </div>
            {loading && <p className="text-gray-500 text-center">Đang tải...</p>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {pets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedPetId === pet.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedPetId(pet.id)}
                  >
                    <img
                      src={pet.avtUrl || 'https://via.placeholder.com/80'}
                      alt={pet.name}
                      className="w-16 h-16 rounded-full object-cover mr-4 shadow-sm"
                    />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{pet.name}</p>
                      <p className="text-sm text-gray-600">
                        {pet.species} - {pet.breed} ({pet.age} tuổi, {pet.weight}kg)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Bạn chưa có thú cưng nào. Hãy thêm một thú cưng mới!</p>
            )}
          </div>

          {/* Booking Time */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Chọn Thời Gian</h3>
            <input
              type="datetime-local"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Phương Thức Thanh Toán</h3>
            <div className="flex space-x-6">
              <div
                className={`flex-1 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  paymentMethod === 'WALLET'
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setPaymentMethod('WALLET')}
              >
                <FaWallet className="text-xl mx-auto mb-2 text-gray-700" />
                <p className="text-lg font-semibold text-gray-800 text-center">Ví Điện Tử</p>
                <p className="text-sm text-gray-600 text-center">Thanh toán qua ví</p>
              </div>
              <div
                className={`flex-1 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  paymentMethod === 'QR_CODE'
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setPaymentMethod('QR_CODE')}
              >
                <FaQrcode className="text-xl mx-auto mb-2 text-gray-700" />
                <p className="text-lg font-semibold text-gray-800 text-center">QR Code</p>
                <p className="text-sm text-gray-600 text-center">Quét mã QR để thanh toán</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {!qrCodeUrl && !detailedBooking && !showWalletPopup && !showRechargePopup && !showAddPetForm && (
            <div className="text-center">
              {success && <p className="text-green-500 mb-4">{success}</p>}
              <button
                onClick={handleBooking}
                disabled={loading}
                className={`w-full max-w-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-300 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add Pet Popup */}
      {showAddPetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-teal-400"></div>
            <div className="absolute bottom-0 right-0 opacity-10">
              <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm8 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4 6c1.66 0 3 1.34 3 3v1H9v-1c0-1.66 1.34-3 3-3z" />
              </svg>
            </div>
            <button
              onClick={() => setShowAddPetForm(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Thêm Thú Cưng Mới</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tên thú cưng"
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                placeholder="Loài (VD: Chó, Mèo)"
                value={newPet.species}
                onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                placeholder="Giống (VD: Poodle, Mèo Ba Tư)"
                value={newPet.breed}
                onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="number"
                placeholder="Tuổi"
                value={newPet.age}
                onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="number"
                placeholder="Cân nặng (kg)"
                value={newPet.weight}
                onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPetImage(e.target.files?.[0] || null)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleAddPet}
                className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white py-3 rounded-lg font-semibold shadow-md hover:from-green-500 hover:to-teal-500 transition-all duration-300"
              >
                Thêm Thú Cưng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Payment Pop-up */}
      {showWalletPopup && userInfo && totalPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full relative">
            <button
              onClick={() => setShowWalletPopup(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Xác Nhận Thanh Toán Qua Ví</h3>
            <p className="text-gray-600 text-center mb-2">
              Số tiền: {totalPrice.toLocaleString()} VND
            </p>
            <p className="text-gray-600 text-center mb-2">
              Số dư hiện tại: {parseFloat(userInfo.result.balance).toLocaleString()} VND
            </p>
            {totalPrice > parseFloat(userInfo.result.balance) ? (
              <p className="text-red-500 text-center mb-4">
                Số dư không đủ. Vui lòng nạp tiền!
              </p>
            ) : (
              <p className="text-green-500 text-center mb-4">Số dư đủ để thanh toán.</p>
            )}
            <div className="text-center">
              <button
                onClick={handleWalletPayment}
                className="bg-blue-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 mr-2"
              >
                Xác Nhận
              </button>
              <button
                onClick={() => setShowWalletPopup(false)}
                className="bg-gray-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Pop-up */}
      {showRechargePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full relative">
            <button
              onClick={() => {
                setShowRechargePopup(false);
                setRechargeQrUrl(null);
                setRechargeDes(null);
              }}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            {!rechargeQrUrl ? (
              <>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Nạp Tiền Vào Ví</h3>
                <p className="text-gray-600 text-center mb-4">
                  Vui lòng chọn hoặc nhập số tiền để nạp:
                </p>
                <div className="flex justify-center gap-2 mb-4">
                  {[100000, 200000, 300000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRechargeAmount(amount)}
                      className={`px-4 py-2 rounded-lg ${
                        rechargeAmount === amount
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {amount.toLocaleString()} VND
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={rechargeAmount || ''}
                  onChange={(e) => setRechargeAmount(parseInt(e.target.value) || null)}
                  placeholder="Nhập số tiền khác"
                  className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleRecharge}
                  disabled={!rechargeAmount}
                  className={`w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 ${
                    !rechargeAmount ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Nạp Tiền
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Quét QR Code để Nạp Tiền</h3>
                <img src={rechargeQrUrl} alt="Recharge QR Code" className="mx-auto mb-4 w-64 h-64" />
                <p className="text-gray-600 text-center mb-2">Thời gian còn lại: {formatTimeLeft(timeLeft)}</p>
                <p className="text-gray-600 text-center mb-2">
                  Số tiền: {rechargeAmount?.toLocaleString() || 'Đang xác nhận'} VND
                </p>
                <p className="text-gray-600 text-center">Vui lòng quét mã QR để nạp tiền.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* QR Code Pop-up */}
      {qrCodeUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full relative">
            <button
              onClick={() => setQrCodeUrl(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Quét QR Code để Thanh Toán</h3>
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4 w-64 h-64" />
            <p className="text-gray-600 text-center mb-2">Thời gian còn lại: {formatTimeLeft(timeLeft)}</p>
            <p className="text-gray-600 text-center">
              Số tiền: {totalPrice?.toLocaleString() || 'Đang xác nhận'} VND
            </p>
            <p className="text-gray-600 text-center">Vui lòng quét mã QR để hoàn tất thanh toán.</p>
          </div>
        </div>
      )}

      {/* Detailed Booking Pop-up */}
      {detailedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full relative">
            <button
              onClick={() => navigate('/')}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-2xl font-semibold text-green-600 mb-4 text-center">Đặt Lịch Thành Công</h3>
            <div className="flex items-center space-x-6">
              <img
                src={detailedBooking.result.pet.avtUrl || 'https://via.placeholder.com/80'}
                alt={detailedBooking.result.pet.name}
                className="w-20 h-20 rounded-full object-cover shadow-md"
              />
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800">
                  Mã đặt lịch: {detailedBooking.result.id}
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  Dịch vụ: {detailedBooking.result.serviceTypeResponse.name}
                </p>
                <p className="text-gray-600">Shop: {detailedBooking.result.shopName}</p>
                <p className="text-gray-600">
                  Thú cưng: {detailedBooking.result.pet.name} ({detailedBooking.result.pet.species} -{' '}
                  {detailedBooking.result.pet.breed})
                </p>
                <p className="text-gray-600">
                  Thời gian: {formatDateTime(detailedBooking.result.bookingTime)}
                </p>
                <p className="text-gray-600">
                  Tổng tiền: {detailedBooking.result.totalPrice.toLocaleString()} VND
                </p>
                <p className="text-gray-600">
                  Trạng thái:{' '}
                  <span className="text-green-500 font-semibold">{detailedBooking.result.status}</span>
                </p>
                <p className="text-gray-600">Phương thức: {detailedBooking.result.paymentMethod}</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/home')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 VetTrack. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-blue-300">Chính sách bảo mật</a>
            <a href="#" className="hover:text-blue-300">Liên hệ</a>
            <a href="#" className="hover:text-blue-300">Điều khoản sử dụng</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;