import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../../Base_Api";
import { Link } from "react-router-dom";
import Header from "./Header";
import { gsap } from "gsap";
import image from "../assets/image.png";
import hinhanh from "../assets/image.png";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  shopId: string | null;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  services: Service[];
  avtUrl?: string;
}

interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avtUrl?: string;
}

const HomePage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null); // Changed to div ref for the image container

  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  const slides = [
    {
      url: image,
      title: "Because Good Life Is More Than Just Good Foods",
      subtitle: "Dogs laugh, but they laugh with their tails",
    },
    {
      url: "https://img4.thuthuatphanmem.vn/uploads/2020/05/16/hinh-anh-nen-meo-den_044008487.jpg",
      title: "Premium Pet Care Services",
      subtitle: "Providing the best for your furry friends",
    },
    {
      url: "https://taimienphi.vn/tmp/cf/aut/hinh-nen-den-1.jpg",
      title: "Happy Pets, Happy Life",
      subtitle: "Quality products for your beloved companions",
    },
  ];

  useEffect(() => {
    fetchShops();
    if (token) fetchUserData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleSlideChange();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/shops/getAllShops");
      const shopsData = response.data.result || [];
      setShops(shopsData);
    } catch (err) {
      setError("Failed to fetch shops. Please try again.");
      console.error("Fetch shops error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    setUserLoading(true);
    try {
      const response = await axiosInstance.get("/users/myInfo");
      setUserData(response.data.result);
    } finally {
      setUserLoading(false);
    }
  };

  const handleSlideChange = () => {
    if (slideRef.current) {
      gsap.to(slideRef.current, {
        opacity: 0,
        scale: 0.95,
        x: 20,
        y: 20,
        duration: 0.5,
        ease: "power1.out",
        onComplete: () => {
          setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
          gsap.fromTo(
            slideRef.current,
            { opacity: 0, scale: 0.95, x: -20, y: -20 },
            { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.5, ease: "power1.in" }
          );
        },
      });
    }
  };

  const prevSlide = () => {
    if (slideRef.current) {
      gsap.to(slideRef.current, {
        opacity: 0,
        scale: 0.95,
        x: -20,
        y: -20,
        duration: 0.5,
        ease: "power1.out",
        onComplete: () => {
          setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
          gsap.fromTo(
            slideRef.current,
            { opacity: 0, scale: 0.95, x: 20, y: 20 },
            { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.5, ease: "power1.in" }
          );
        },
      });
    }
  };

  const nextSlide = () => {
    handleSlideChange();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header userData={userData} token={token} />

      {/* Hero Section with Carousel */}
      <div className="relative w-full h-[600px] py-32">
        {/* Background Image Layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div
            ref={slideRef}
            className="absolute inset-0 w-full h-full transition-opacity duration-500"
            style={{ backgroundImage: `url(${slides[currentSlide].url})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        </div>

        {/* Text and buttons container (fixed on the left) */}
        {/* Text and buttons container (fixed on the left) */}
<div className="relative container mx-auto px-4 flex items-center justify-start h-full text-left max-w-7xl">
  <div className="w-full md:w-1/2   p-8 rounded-xl">
    <h1 className="text-4xl md:text-5xl font-bold text-amber-200 mb-4 transition-all duration-500 drop-shadow-lg">
      {slides[currentSlide].title}
    </h1>
    <p className="text-stone-100 text-lg mb-6 transition-all duration-500 drop-shadow-md">
      {slides[currentSlide].subtitle}
    </p>
    <Link
      to="/services"
      className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 
      transition-all duration-300 inline-block shadow-lg hover:shadow-xl 
      hover:-translate-y-0.5 font-medium"
    >
      Đặt Lịch Ngay !!!
    </Link>
  </div>
</div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots for indicating current image */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-orange-500" : "bg-gray-400"}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Journey Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-pink-50 rounded-2xl p-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop"
              alt="Pet Love"
              className="rounded-lg"
            />
          </div>
          <div className="md:w-1/2 md:pl-8">
            <span className="text-orange-500 font-medium">Our Pet 2025 Store</span>
            <h2 className="text-3xl font-bold text-gray-800 mt-2 mb-4">
              The Journey To Our Meowzy A Passion For Pets
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <p>Over 15 years of experience</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <p>Premium certified pet food</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <p>High-quality pet accessories</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <p>Regular veterinary checkups</p>
              </div>
            </div>
            <button className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors">
              Tìm Hiểu Về Chúng Tôi
            </button>
          </div>
        </div>
      </div>

      {/* CTA Sections */}
      <div className="container mx-auto px-4 py-12">
  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Danh Mục <span className="text-blue-500">Sản Phẩm</span></h2>
  
  <div className="grid md:grid-cols-2 gap-8">
    {/* Pet Food Card */}
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative h-64 overflow-hidden">
        <img 
          src="https://nativespeaker.vn/uploaded/page_1600_1712215630_1713753920.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Pet Food" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="bg-orange-500 p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Đồ Ăn Cho Thú Cưng</h3>
        <p className="text-white text-sm mb-4">
          Các sản phẩm dinh dưỡng chất lượng cao, đảm bảo sức khỏe tối ưu cho thú cưng của bạn
        </p>
        <Link
          to="/products?type=FOOD"
          className="inline-flex items-center bg-white text-orange-600 px-6 py-2 rounded-full font-medium hover:bg-orange-50 transition-colors"
        >
          Mua Ngay
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>

    {/* Pet Accessories Card */}
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative h-64 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1560743641-3914f2c45636?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Pet Accessories" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="bg-pink-500 p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Phụ Kiện Cho Thú Cưng</h3>
        <p className="text-white text-sm mb-4">
          Đa dạng phụ kiện thời trang, tiện ích giúp thú cưng của bạn luôn thoải mái và đáng yêu
        </p>
        <Link
          to="/products?type=ACCESSORY"
          className="inline-flex items-center bg-white text-pink-600 px-6 py-2 rounded-full font-medium hover:bg-pink-50 transition-colors"
        >
          Mua Ngay
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  </div>

  <div className="mt-12 text-center">
    <Link 
      to="/products" 
      className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
    >
      Xem Tất Cả Sản Phẩm
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </Link>
  </div>
</div>

      {/* Shops List */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Partner Shops</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading && <p className="text-gray-500 text-center mb-4">Loading...</p>}
        {shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {shop.avtUrl ? (
                  <img src={shop.avtUrl} alt={shop.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{shop.name}</h3>
                  <p className="text-gray-600 mb-2">{shop.address}</p>
                  <p className="text-gray-600 mb-4">{shop.phoneNumber}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-gray-500 text-center">No shops available.</p>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">VetTrack</h3>
            <p className="mb-4">Your trusted partner in pet care</p>
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#" className="hover:text-orange-500 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Contact
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Terms of Service
              </a>
            </div>
            <p className="text-sm text-gray-400">© 2025 VetTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Inline CSS for Flip Animation */}
      <style jsx>{`
        @keyframes flipOut {
          0% {
            opacity: 1;
            transform: perspective(400px) rotateY(0deg);
          }
          100% {
            opacity: 0;
            transform: perspective(400px) rotateY(90deg);
          }
        }

        @keyframes flipIn {
          0% {
            opacity: 0;
            transform: perspective(400px) rotateY(-90deg);
          }
          100% {
            opacity: 1;
            transform: perspective(400px) rotateY(0deg);
          }
        }

        .flip-out {
          animation: flipOut 0.5s ease-out forwards;
        }

        .flip-in {
          animation: flipIn 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;