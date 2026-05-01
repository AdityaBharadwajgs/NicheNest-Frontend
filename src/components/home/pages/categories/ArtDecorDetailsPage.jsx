import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/reusable/Button";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import AxiosInstance from "../../../../config/Api_call";
import { errorToast, successToast } from "../../../../plugins/toast";

const API = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

// ⭐ Render Star Ratings
const renderStars = (rating) => {
  if (!rating) return null;
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < full; i++) stars.push(<FaStar key={`f-${i}`} className="text-yellow-400" />);
  if (half) stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
  for (let i = 0; i < empty; i++) stars.push(<FaRegStar key={`e-${i}`} className="text-yellow-400" />);
  return stars;
};

export default function ArtDecorDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API}/products/${id}?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    window.scrollTo(0, 0);
  }, [id]);

  // Add to Cart handler
  const handleAddToCart = async () => {
    if (!userId) {
      errorToast("Please log in to add to cart.");
      navigate('/login');
      return;
    }
    try {
      await AxiosInstance.post(`/cart/${userId}/add`, { product: { id } });
      successToast("Added to cart!");
      navigate('/cart');
    } catch (err) {
      errorToast("Failed to add to cart.");
    }
  };

  // Buy Now handler
  const handleBuyNow = async () => {
    if (!userId) {
      errorToast("Please log in to buy products.");
      navigate('/login');
      return;
    }
    try {
      await AxiosInstance.post(`/cart/${userId}/add`, { product: { id } });
      navigate('/order', { state: { product } });
    } catch (err) {
      errorToast("Failed to process checkout.");
    }
  };

  // Add to Wishlist handler
  const handleAddToWishlist = async () => {
    if (!userId) {
      errorToast("Please log in to add to wishlist.");
      return;
    }
    try {
      await AxiosInstance.post(`/users/${userId}/wishlist`, { productId: id });
      successToast("Added to wishlist!");
    } catch (err) {
      errorToast("Failed to add to wishlist.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Loading product...</h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Art item not found</h2>
        <Link to="/categories/art-decor">
          <Button>← Back to Art & Decor</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-12 space-y-10 font-sans">
      {/* Back Button */}
      <Link to="/categories/art-decor">
        <Button className="mb-6">← Back to Art & Decor Category</Button>
      </Link>

      {/* Product Info Section */}
      <div className="flex flex-col md:flex-row gap-10">
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/2 rounded-2xl object-cover shadow-lg"
        />

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-green-800">{product.name}</h2>
          <p className="text-gray-600">Category: <strong>{product.category}</strong></p>
          <p className="text-2xl font-bold text-green-700">₹{product.price}</p>
          <p className="text-sm text-gray-600">Stock Available: {product.stock || 'Available'}</p>

          <div className="flex items-center gap-2">
            {renderStars(product.rating || 4)}
            <span className="text-sm text-gray-600">({product.rating || 4} / 5)</span>
          </div>

          <p className="text-gray-700">{product.description}</p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddToCart}>🛒 Add to Cart</Button>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleAddToWishlist}>❤️ Add to Wishlist</Button>
          </div>
        </div>
      </div>

      {/* Product Specifications */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Category:</span>
            <span>{product.category}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Price:</span>
            <span className="text-green-600 font-bold">₹{product.price}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Stock:</span>
            <span>{product.stock || 'Available'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Rating:</span>
            <span className="flex items-center gap-1">
              {renderStars(product.rating || 4)}
              <span>({product.rating || 4}/5)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="bg-gray-50 p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Meera D.</span>
              <div className="flex items-center gap-1">{renderStars(5)}</div>
            </div>
            <p className="text-gray-700">Stunning piece! The colors are vibrant and it adds so much character to my living room."</p>
            <p className="text-sm text-gray-500 mt-1">4 days ago</p>
          </div>
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Rahul S.</span>
              <div className="flex items-center gap-1">{renderStars(4)}</div>
            </div>
            <p className="text-gray-700">Beautiful craftsmanship and fast delivery. Will definitely recommend to friends!"</p>
            <p className="text-sm text-gray-500 mt-1">1 week ago</p>
          </div>
        </div>
      </div>

      {/* Shipping & Returns */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Shipping & Returns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 text-green-600">🚚 Shipping Information</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Dispatched within 2-4 business days</li>
              <li>• Free shipping on orders above ₹999</li>
              <li>• Standard delivery: 3-5 business days</li>
              <li>• Express delivery: 1-2 business days</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-blue-600">🔄 Return Policy</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Easy 7-day return & replacement</li>
              <li>• No questions asked return policy</li>
              <li>• Free return shipping</li>
              <li>• Full refund or replacement</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment & Security */}
      <div className="bg-gray-50 p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Payment & Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white rounded-lg">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-medium mb-1">Secure Payments</h4>
            <p className="text-sm text-gray-600">SSL encrypted transactions</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <div className="text-2xl mb-2">💳</div>
            <h4 className="font-medium mb-1">Multiple Options</h4>
            <p className="text-sm text-gray-600">UPI, Cards, Net Banking</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <div className="text-2xl mb-2">🛡️</div>
            <h4 className="font-medium mb-1">Buyer Protection</h4>
            <p className="text-sm text-gray-600">100% secure shopping</p>
          </div>
        </div>
      </div>
    </div>
  );
}
