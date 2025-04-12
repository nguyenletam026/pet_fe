import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import AdminPage from './components/AdminPage';
import SignupForm from './components/SignupForm';
import Profile from './components/Profile';
import HomePage from './components/HomePage';
import OwnerPage from './components/OwnerPage';
import ServicePage from './components/ServicePage';
import BookingPage from './components/BookingPage';
import Schedule from './components/Schedule';
import ProductPage from "./components/ProductPage";
import CartPage from './components/Cart';
import OrderHistoryPage from './components/OrderHistoryPage';
const App = () => {
  return (
    <BrowserRouter basename="/pet_fe">
      <Routes>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/" element={<LoginForm />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/services" element={<ServicePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/owner" element={<OwnerPage />} />
        <Route path="/schedule" element={<Schedule />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App
