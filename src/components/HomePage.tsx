import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../Base_Api";
import { Link } from "react-router-dom";
import Header from "./Header";

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
      url: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&auto=format&fit=crop",
      title: "Because Good Life Is More Than Just Good Foods",
      subtitle: "Dogs laugh, but they laugh with their tails"
    },
    {
      url: "https://images.pexels.com/photos/2606018/pexels-photo-2606018.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      title: "Premium Pet Care Services",
      subtitle: "Providing the best for your furry friends"
    },
    {
      url: "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      title: "Happy Pets, Happy Life",
      subtitle: "Quality products for your beloved companions"
    }
  ];

  useEffect(() => {
    fetchShops();
    if (token) fetchUserData();
  }, []);

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

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header userData={userData} token={token} />

      {/* Hero Section with Carousel */}
      <div className="relative w-full h-[600px] py-32 mt-"> {/* Added mt-20 */}
        {/* Carousel Images */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={slides[currentSlide].url}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-blue-50/50" />
        </div>

        {/* Text and buttons container */}
        <div className="relative container mx-auto px-4 flex flex-col items-center justify-center h-full text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 transition-all duration-500">
              {slides[currentSlide].title}
            </h1>
            <p className="text-gray-600 mb-6 transition-all duration-500">
              {slides[currentSlide].subtitle}
            </p>
            <button className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-colors">
              Shop Now
            </button>
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
              className={`w-3 h-3 rounded-full ${
                currentSlide === index ? 'bg-orange-500' : 'bg-gray-400'
              }`}
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
              Read More
            </button>
          </div>
        </div>
      </div>

      {/* CTA Sections */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-orange-400 rounded-2xl p-8 text-white flex items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">We Care & Share Love For Pets</h3>
              <button className="bg-white text-orange-500 px-6 py-2 rounded-full mt-4 hover:bg-gray-100 transition-colors">
                Read More
              </button>
            </div>
          </div>
          <div className="bg-pink-400 rounded-2xl p-8 text-white flex items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Dog Clothing & Accessories</h3>
              <button className="bg-white text-pink-500 px-6 py-2 rounded-full mt-4 hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
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
                  <img
                    src={shop.avtUrl}
                    alt={shop.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{shop.name}</h3>
                  <p className="text-gray-600 mb-2">{shop.address}</p>
                  <p className="text-gray-600 mb-4">{shop.phoneNumber}</p>
                  <Link
                    to={`/shop/${shop.id}`}
                    className="block w-full bg-orange-500 text-white text-center py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Book Now
                  </Link>
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
    </div>
  );
};

export default HomePage;