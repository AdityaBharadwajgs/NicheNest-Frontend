import React, { useState, useEffect } from "react";
import AxiosInstance from "../../config/Api_call";
import Navbar from "../navbar/Navbar";
import { FaTrash, FaPlus, FaMinus, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Button } from "../reusable/Button";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  // Fetch cart from backend
  useEffect(() => {
    if (userId) fetchCart();
    else setCartItems([]);
  }, [userId]);

  const fetchCart = async () => {
    if (!userId) return setCartItems([]);
    try {
      const res = await AxiosInstance.get(`/cart/${userId}`);
      setCartItems(res.data);
    } catch {
      setCartItems([]);
    }
  };

  const updateQuantity = async (id, type) => {
    if (!userId) return;
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;
    const newQty = type === "inc" ? item.quantity + 1 : Math.max(1, item.quantity - 1);
    try {
      await AxiosInstance.put(`/cart/${userId}/update`, {
        productId: id,
        quantity: newQty,
      });
      fetchCart();
    } catch {}
  };

  const removeItem = async (id) => {
    if (!userId) return;
    try {
      await AxiosInstance.delete(`/cart/${userId}/remove/${id}`);
      fetchCart();
    } catch {}
  };

  // Calculate subtotal before promo
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingCost = subtotal >= 999 ? 0 : (cartItems.length > 0 ? 30 : 0);

  // Promo logic
  const handleApplyPromo = () => {
    setPromoError("");
    let appliedDiscount = 0;
    const code = promoCode.trim().toLowerCase();

    if (code === "desi10") {
      if (subtotal >= 2000) {
        appliedDiscount = 0.20; // 20%
        setDiscount(appliedDiscount);
        alert("✅ 20% discount applied!");
      } else {
        setDiscount(0);
        setPromoError("DESI10 is only valid for orders ₹2000 or above.");
        alert("❌ DESI10 is only valid for orders ₹2000 or above.");
      }
    } else if (code === "freeship") {
      if (subtotal < 2000) {
        appliedDiscount = 0.05; // 5%
        setDiscount(appliedDiscount);
        alert("✅ 5% discount applied!");
      } else {
        setDiscount(0);
        setPromoError("FREESHIP is only valid for orders below ₹2000.");
        alert("❌ FREESHIP is only valid for orders below ₹2000.");
      }
    } else {
      setDiscount(0);
      setPromoError("Invalid promo code.");
      alert("❌ Invalid promo code");
    }
  };

  const handleCheckout = async () => {
    if (!userId) return;
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before checkout.");
      return;
    }
    try {
      const res = await AxiosInstance.post(`/cart/checkout`, {
        userId,
        code: promoCode,
      });
      navigate('/order', {
        state: {
          product: cartItems[0],
          cartItems: cartItems,
          subtotal: res.data.subtotal,
          shipping: res.data.shipping,
          discount: res.data.discount,
          total: res.data.total,
          isFromCart: true
        }
      });
    } catch (err) {
      alert("❌ Checkout failed.");
    }
  };

  const totalDiscount = subtotal * discount;
  const total = subtotal + shippingCost - totalDiscount;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">🛒 My Cart</h1>

        {cartItems.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex items-center justify-center">
              <Link to="/home">
                <Button className="bg-green-600 text-white mt-4">Browse Products</Button>
              </Link>
            </div>
            <div className="bg-gray-100 p-6 rounded-xl shadow-sm border space-y-6">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₹{shippingCost}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-₹{totalDiscount.toFixed()}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-semibold"><span>Total</span><span>₹{total.toFixed()}</span></div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <Button onClick={handleApplyPromo} className="bg-green-600 text-white px-4 rounded-lg">
                  Apply
                </Button>
              </div>
              {promoError && <div className="text-red-500 text-xs mt-1">{promoError}</div>}
              <div className="mt-2 text-xs text-gray-600">
                <div className="mb-1 font-semibold">Available Promo Codes:</div>
                <div className="flex flex-col gap-1">
                  <span className="bg-gray-100 px-2 py-1 rounded">DESI10 &mdash; 20% off (₹2000+)</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">FREESHIP &mdash; 5% off (&lt; ₹2000)</span>
                </div>
              </div>
              <Button onClick={handleCheckout} className="w-full py-3 bg-green-700 text-white rounded-xl font-semibold">
                Proceed to Checkout
              </Button>
              <p className="text-xs text-gray-600 mt-2">🔒 Secure checkout • 7‑day returns • GST invoice</p>
              <div className="mt-6 space-y-4">
                <h3 className="text-md font-semibold border-b pb-1">Items in Your Cart</h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-4 rounded-xl shadow border flex flex-col sm:flex-row gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                    <p className="text-sm text-gray-600">Delivery: {item.estDelivery}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 font-bold">₹{item.price}</span>
                      <div className="flex items-center gap-2 border px-2 py-1 rounded-md">
                        <button onClick={() => updateQuantity(item.id, "dec")}><FaMinus /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, "inc")}><FaPlus /></button>
                      </div>
                      <span className="text-gray-500">Subtotal: ₹{item.price * item.quantity}</span>
                    </div>
                    <p className="text-sm text-gray-600">Shipping: {item.shipping}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm mt-2"
                    >
                      <FaTrash className="inline mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-100 p-6 rounded-xl shadow-sm border space-y-6">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₹{shippingCost}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-₹{totalDiscount.toFixed()}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-semibold"><span>Total</span><span>₹{total.toFixed()}</span></div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <Button onClick={handleApplyPromo} className="bg-green-600 text-white px-4 rounded-lg">
                  Apply
                </Button>
              </div>
              {promoError && <div className="text-red-500 text-xs mt-1">{promoError}</div>}
              <div className="mt-2 text-xs text-gray-600">
                <div className="mb-1 font-semibold">Available Promo Codes:</div>
                <div className="flex flex-col gap-1">
                  <span className="bg-gray-100 px-2 py-1 rounded">DESI10 &mdash; 20% off (₹2000+)</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">FREESHIP &mdash; 5% off (&lt; ₹2000)</span>
                </div>
              </div>
              <Button onClick={handleCheckout} className="w-full py-3 bg-green-700 text-white rounded-xl font-semibold">
                Proceed to Checkout
              </Button>
              <p className="text-xs text-gray-600 mt-2">🔒 Secure checkout • 7‑day returns • GST invoice</p>
              <div className="mt-6 space-y-4">
                <h3 className="text-md font-semibold border-b pb-1">Items in Your Cart</h3>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-700">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-16 rounded-t-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-3">About Us</h4>
            <p className="text-sm leading-relaxed">
              We connect artisans with customers who appreciate handmade craftsmanship.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li><Link to="/categories/art-decor" className="hover:underline">Categories</Link></li>
              <li><Link to="/offers" className="hover:underline">Offers</Link></li>
              <li><Link to="/support" className="hover:underline">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">Connect With Us</h4>
            <div className="flex gap-4 text-xl text-green-400 mt-2">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaTwitter /></a>
            </div>
            <p className="text-sm mt-4">📧 support@desietsy.com</p>
            <p className="text-sm">📞 +91 98765 43210</p>
          </div>
        </div>
        <p className="text-center mt-10 text-sm text-gray-400">
          © 2025 DesiEtsy. Celebrating handmade culture.
        </p>
      </footer>
    </div>
  );
}
