import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Home & Landing
import Home from '../components/home/Home';
import Login from '../components/authentication/Login/LogIn';

// Authentication
import RegisterUser from '../components/authentication/SignUp/Register_user';
import GenerateOtp from '../components/authentication/SignUp/Generate_otp';
import OtpVerification from '../components/authentication/SignUp/Otp_verification';
import SetPassword from '../components/authentication/SignUp/Set_password';

// Pages
import ProfilePage from '../components/ProfilePage';
import CartPage from '../components/home/CartPage';
import ProductDetails from '../components/home/ProductDetailsPage';
import SearchResultsPage from '../components/home/SearchResultsPage';
import OrderPage from '../components/home/OrderPage';


// Category Pages
import ArtDecor from '../components/home/pages/categories/ArtDecor';
import ArtDecorDetailsPage from '../components/home/pages/categories/ArtDecorDetailsPage';
import Jewelry from '../components/home/pages/categories/Jewelry';
import JewelryDetailsPage from '../components/home/pages/categories/JewelryDetailsPage';
import Clothing from '../components/home/pages/categories/Clothing';
import ClothingDetailsPage from '../components/home/pages/categories/ClothingDetailsPage';

// Admin Panel
import AdminDashboard from '../components/home/AdminDashboard';
import AddProduct from '../components/home/AddProduct';
import AddArtisan from '../components/home/AddArtisan';
import EditArtisan from '../components/home/EditArtisan';
import EditProduct from '../components/home/EditProduct';
import TrackOrder from "./home/TrackOrder";

// Role Guard
const RestrictedForAdmin = ({ children }) => {
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const Routing = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/search' element={<SearchResultsPage />} />

        {/* Authentication */}
        <Route path='/register_user' element={<RegisterUser />} />
        <Route path='/generate_otp' element={<GenerateOtp />} />
        <Route path='/verify_otp' element={<OtpVerification />} />
        <Route path='/set_password' element={<SetPassword />} />
        <Route path='/login' element={<Login />} />

        {/* User-only */}
        <Route path="/profile" element={<RestrictedForAdmin><ProfilePage /></RestrictedForAdmin>} />
        <Route path='/cart' element={<RestrictedForAdmin><CartPage /></RestrictedForAdmin>} />

        {/* Product Details */}
        <Route path='/product/:id' element={<ProductDetails />} />

        {/* Categories */}
        <Route path='/categories/art-decor' element={<ArtDecor />} />
        <Route path='/categories/art-decor/:id' element={<ArtDecorDetailsPage />} />
        <Route path='/categories/jewelry' element={<Jewelry />} />
        <Route path='/categories/jewelry/:id' element={<JewelryDetailsPage />} />
        <Route path='/categories/clothing' element={<Clothing />} />
        <Route path='/categories/clothing/:id' element={<ClothingDetailsPage />} />

        {/* Admin */}
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/admin/add-product' element={<AddProduct />} />
        <Route path='/admin/add-artisan' element={<AddArtisan />} />
        <Route path='/admin/edit-artisan/:id' element={<EditArtisan />} />
        <Route path='/admin/edit-product/:id' element={<EditProduct />} />

        {/* Order */}
        <Route path='/order' element={<RestrictedForAdmin><OrderPage /></RestrictedForAdmin>} />

        {/* Track */}
        <Route path="/track-order/:trackingId" element={<RestrictedForAdmin><TrackOrder /></RestrictedForAdmin>} />
      </Routes>
    </Router>
  );
};

export default Routing;