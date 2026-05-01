import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../../reusable/Button";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import AxiosInstance from "../../../../config/Api_call";
import { errorToast, successToast } from "../../../../plugins/toast";

const API = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

// ⭐ Render star ratings
const renderStars = (rating) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < full; i++) stars.push(<FaStar key={`f-${i}`} className="text-yellow-400" />);
  if (half) stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
  for (let i = 0; i < empty; i++) stars.push(<FaRegStar key={`e-${i}`} className="text-yellow-400" />);
  return stars;
};

export default function JewelryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const userId = user ? user._id : null;

    if (!userId) {
      errorToast("Please log in to add to cart.");
      navigate('/login');
      return;
    }

    try {
      await AxiosInstance.post(`/cart/${userId}/add`, {
        product: { id: product._id }
      });
      successToast("Added to cart!");
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      errorToast('Failed to add product to cart');
    }
  };

  // Buy Now handler
  const handleBuyNow = () => {
    navigate('/order', {
      state: {
        product: product,
        quantity: 1,
        isDirectPurchase: true
      }
    });
  };

  // Add to Wishlist handler
  const handleAddToWishlist = () => {
    successToast('Product added to wishlist!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-xl">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Product not found</h2>
        <Link to="/categories/jewelry">
          <Button>← Back to Jewellery</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-12 space-y-10 font-sans">
      <Link to="/categories/jewelry">
        <Button className="mb-6">← Back to Jewellery</Button>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col md:flex-row gap-10">
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/2 rounded-2xl object-cover shadow-lg"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x400?text=Image+Unavailable";
          }}
        />

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-green-800">{product.name}</h2>
          <p className="text-gray-600">Artisan: <strong>{product.artisan || 'Handcrafted by Local Artisan'}</strong></p>
          <p className="text-2xl font-bold text-green-700">₹{product.price}</p>
          <p className="text-sm text-gray-600">Stock Available: {product.stock || 'In Stock'}</p>

          <div className="flex items-center gap-2">
            {renderStars(product.rating || 4.5)}
            <span className="text-sm text-gray-600">({product.rating || 4.5} / 5)</span>
          </div>

          <p className="text-gray-700">{product.description}</p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Button 
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              🛒 Add to Cart
            </Button>
            <Button 
              onClick={handleAddToWishlist}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              ❤️ Add to Wishlist
            </Button>
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
            <span>{product.stock || 'In Stock'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Rating:</span>
            <span className="flex items-center gap-1">
              {renderStars(product.rating || 4.5)}
              <span>({product.rating || 4.5}/5)</span>
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
              <span className="font-medium">Priya</span>
              <div className="flex items-center gap-1">{renderStars(4.5)}</div>
            </div>
            <p className="text-gray-700">Beautiful craftsmanship and excellent quality!</p>
            <p className="text-sm text-gray-500 mt-1">2 days ago</p>
          </div>
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Anita</span>
              <div className="flex items-center gap-1">{renderStars(5)}</div>
            </div>
            <p className="text-gray-700">Absolutely love this piece. Perfect for special occasions.</p>
            <p className="text-sm text-gray-500 mt-1">5 days ago</p>
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