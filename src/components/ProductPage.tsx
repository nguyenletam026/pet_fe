import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../Base_Api";
import { useLocation } from "react-router-dom";
import Header from "./Header";

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
  }, []);

  useEffect(() => {
    // Get the type from query parameters
    const params = new URLSearchParams(location.search);
    const type = params.get("type") || "FOOD"; // Default to FOOD if no type is specified

    // Filter products based on the type
    const filtered = products.filter((product) => product.type === type);
    setFilteredProducts(filtered);
  }, [products, location.search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/products");
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

  return (
    <div className="min-h-screen bg-white">
      <Header userData={userData} token={token} />

      {/* Products List */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {new URLSearchParams(location.search).get("type") === "FOOD"
            ? "Pet Food Products"
            : "Pet Accessories"}
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading && <p className="text-gray-500 text-center mb-4">Loading...</p>}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2">Price: ${product.price.toFixed(2)}</p>
                  <p className="text-gray-600 mb-4">Type: {product.type}</p>
                  <button
                    className="block w-full bg-orange-500 text-white text-center py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-gray-500 text-center">No products available.</p>
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

export default ProductPage;