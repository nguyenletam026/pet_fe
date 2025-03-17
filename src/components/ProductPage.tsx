import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../Base_Api";
import { useLocation, Link } from "react-router-dom";
import Header from "./Header";
import { motion } from "framer-motion";
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, StarFilled } from "@ant-design/icons";
import { publicAxios } from '../../src/untils/axiosConfig';
interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  type: string;
}

interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avtUrl?: string;
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("FOOD");
  const [cartAnimation, setCartAnimation] = useState<number | null>(null);
  const location = useLocation();

  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  useEffect(() => {
    fetchUserData();
    fetchProducts();
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type") || "FOOD";
    setActiveCategory(type);
    const filtered = products.filter((product) => product.type === type);
    setFilteredProducts(filtered);
  }, [products, location.search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await publicAxios.get('/products');
      console.log("Fetch products response:", response);
      const productsData = response.data.result || [];
      setProducts(productsData);
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const response = await axiosInstance.get("/users/myInfo");
      setUserData(response.data.result);
    } catch (err) {
      console.error("Fetch user data error:", err);
    }
  };

  const handleAddToCart = (productId: number) => {
    const quantity = quantities[productId] || 1;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = cart.findIndex((item: { productId: number }) => item.productId === productId);

    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Set animation state
    setCartAnimation(productId);
    setTimeout(() => setCartAnimation(null), 1000);
    
    // Show notification instead of alert
    const notification = document.getElementById("notification");
    if (notification) {
      notification.classList.remove("opacity-0");
      notification.classList.add("opacity-100");
      setTimeout(() => {
        notification.classList.remove("opacity-100");
        notification.classList.add("opacity-0");
      }, 3000);
    }
    
    setQuantities((prev) => ({ ...prev, [productId]: 1 })); // Reset quantity for next use
  };

  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, value) }));
  };

  const toggleFavorite = (productId: number) => {
    let newFavorites;
    if (favorites.includes(productId)) {
      newFavorites = favorites.filter(id => id !== productId);
    } else {
      newFavorites = [...favorites, productId];
    }
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const switchCategory = (category: string) => {
    window.history.pushState({}, "", `?type=${category}`);
    setActiveCategory(category);
    const filtered = products.filter((product) => product.type === category);
    setFilteredProducts(filtered);
  };

  // Product card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header userData={userData} token={token} />

      {/* Hero Banner */}
      <div className="relative bg-cover bg-center h-80 flex items-center" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-extrabold text-white mb-4">Pet Shop</h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Premium products for your beloved pets. Quality food and accessories for a healthy, happy life.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/cart" className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition duration-300 flex items-center">
              <ShoppingCartOutlined className="mr-2" /> View Cart
            </Link>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-8 py-4">
            <button 
              onClick={() => switchCategory("FOOD")}
              className={`px-5 py-2 rounded-full font-medium text-lg transition-all duration-300 ${
                activeCategory === "FOOD" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}>
              Pet Food
            </button>
            <button 
              onClick={() => switchCategory("ACCESSORY")}
              className={`px-5 py-2 rounded-full font-medium text-lg transition-all duration-300 ${
                activeCategory === "ACCESSORIES" ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}>
              Accessories
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      <div id="notification" className="fixed top-24 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 opacity-0 transition-opacity duration-300">
        Product added to cart successfully!
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-2 text-gray-800">
          {activeCategory === "FOOD" ? "Pet Food Collection" : "Pet Accessories"}
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {activeCategory === "FOOD" 
            ? "Premium nutrition for your pets. High-quality ingredients for a healthy diet."
            : "Everything your pet needs for comfort and play. Quality accessories for every pet."}
        </p>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 border-opacity-75"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  cartAnimation === product.id ? 'animate-bounce' : ''
                }`}
              >
                <div className="relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <button 
                    onClick={() => toggleFavorite(product.id)} 
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
                  >
                    {favorites.includes(product.id) ? (
                      <HeartFilled style={{ fontSize: '20px', color: '#f43f5e' }} />
                    ) : (
                      <HeartOutlined style={{ fontSize: '20px', color: '#6b7280' }} />
                    )}
                  </button>
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {product.type}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      <StarFilled />
                      <StarFilled />
                      <StarFilled />
                      <StarFilled />
                      <StarFilled style={{ color: '#d1d5db' }} />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">(4.4)</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
                  <p className="text-2xl font-bold text-orange-600 mb-4">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </p>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center  rounded-lg overflow-hidden">
                      <button 
                        onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)} 
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition border-r border-gray-300"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                        className="w-14 p-1 text-center focus:outline-none"
                        min="1"
                      />
                      <button 
                        onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)} 
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition border-l border-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-lg hover:from-orange-500 hover:to-orange-700 transition duration-300 font-medium flex items-center justify-center"
                  >
                    <ShoppingCartOutlined style={{ fontSize: '18px', marginRight: '8px' }} /> Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7236766-5875081.png" alt="No products" className="w-64 mb-8" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No products available</h3>
              <p className="text-gray-500 mb-6">We couldn't find any products in this category</p>
              <button onClick={() => switchCategory(activeCategory === "FOOD" ? "ACCESSORIES" : "FOOD")} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Check {activeCategory === "FOOD" ? "Accessories" : "Food"} instead
              </button>
            </div>
          )
        )}
        
        {/* Cart Button */}
        <div className="text-center mt-16">
          <Link
            to="/cart"
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-10 py-4 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center mx-auto w-64"
          >
            <ShoppingCartOutlined style={{ fontSize: '22px', marginRight: '10px' }} /> View Cart
          </Link>
        </div>
      </div>

      {/* Featured Section */}
      <div className="bg-gray-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Our Pet Products?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                    <p className="text-gray-400">All our products are made with premium ingredients and materials for the health and comfort of your pets.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Vet Approved</h3>
                    <p className="text-gray-400">Our products are developed with veterinarians to ensure they meet the highest standards of pet health.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Satisfaction Guaranteed</h3>
                    <p className="text-gray-400">We stand behind our products with a 100% satisfaction guarantee. Your pet's happiness is our priority.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                   alt="Happy pets with our products" 
                   className="w-full h-96 object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-orange-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Pet Lovers Community</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Subscribe to our newsletter for exclusive offers, pet care tips, and new product updates.</p>
          <div className="flex max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-4 py-3 rounded-l-lg border-t border-b border-l border-gray-300 focus:outline-none"
            />
            <button className="bg-orange-500 text-white px-6 py-3 rounded-r-lg hover:bg-orange-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">VetTrack</h3>
              <p className="text-gray-400 mb-6">Your trusted partner in pet care. We provide quality products to ensure your pets live a happy and healthy life.</p>
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-4.466 19.59c-.405.078-.534-.171-.534-.384v-2.195c0-.747-.262-1.233-.55-1.481 1.782-.198 3.654-.875 3.654-3.947 0-.874-.312-1.588-.823-2.147.082-.202.356-1.016-.079-2.117 0 0-.671-.215-2.198.82-.64-.18-1.324-.267-2.004-.271-.68.003-1.364.091-2.003.269-1.528-1.035-2.2-.82-2.2-.82-.434 1.102-.16 1.915-.077 2.118-.512.56-.824 1.273-.824 2.147 0 3.064 1.867 3.751 3.645 3.954-.229.2-.436.552-.508 1.07-.457.204-1.614.557-2.328-.666 0 0-.423-.768-1.227-.825 0 0-.78-.01-.055.487 0 0 .525.246.889 1.17 0 0 .463 1.428 2.688.944v1.489c0 .211-.129.459-.528.385-3.18-1.057-5.472-4.056-5.472-7.59 0-4.419 3.582-8 8-8s8 3.581 8 8c0 3.533-2.289 6.531-5.466 7.59z"/>
                  </svg>
                </a>
                <a href="#" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/>
                  </svg>
                </a>
                <a href="#" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shop</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400">123 Main Street, City Name</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-gray-400">+1 (123) 456-7890</span>
                </li>
                </ul>
            </div>
            </div>
            </div>
            </footer>
    </div>
    );
}


export default ProductPage;
