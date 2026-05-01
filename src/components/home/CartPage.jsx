import React, { useState, useEffect } from "react";
import AxiosInstance from "../../config/Api_call";
import Navbar from "../navbar/Navbar";
import { FaTrash, FaPlus, FaMinus, FaFacebook, FaInstagram, FaTwitter, FaShoppingBag, FaShieldAlt, FaTruck } from "react-icons/fa";
import { Button } from "../reusable/Button";
import { Link, useNavigate } from "react-router-dom";
import { errorToast, successToast } from "../../plugins/toast";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  // Fetch cart from backend
  useEffect(() => {
    if (userId) fetchCart();
    else {
      setCartItems([]);
      setIsLoading(false);
    }
  }, [userId]);

  const fetchCart = async (showLoading = true) => {
    if (!userId) return setCartItems([]);
    try {
      if (showLoading) setIsLoading(true);
      const res = await AxiosInstance.get(`/cart/${userId}`);
      setCartItems(res.data);
    } catch {
      setCartItems([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const updateQuantity = async (id, type) => {
    if (!userId) return;
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;
    const newQty = type === "inc" ? item.quantity + 1 : Math.max(1, item.quantity - 1);
    
    // Optimistic Update: Update UI instantly
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQty } : item
    ));

    try {
      await AxiosInstance.put(`/cart/${userId}/update`, {
        productId: id,
        quantity: newQty,
      });
      // Fetch in background without showing loading spinner
      fetchCart(false);
    } catch {
      // Revert on error
      fetchCart(true);
    }
  };

  const removeItem = async (id) => {
    if (!userId) return;
    try {
      await AxiosInstance.delete(`/cart/${userId}/remove/${id}`);
      successToast("Item removed from cart");
      fetchCart();
    } catch {
      errorToast("Failed to remove item");
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 999 ? 0 : (cartItems.length > 0 ? 30 : 0);

  const handleApplyPromo = () => {
    setPromoError("");
    let appliedDiscount = 0;
    const code = promoCode.trim().toLowerCase();

    if (code === "desi10") {
      if (subtotal >= 2000) {
        appliedDiscount = 0.20;
        setDiscount(appliedDiscount);
        successToast("✅ 20% discount applied!");
      } else {
        setDiscount(0);
        setPromoError("DESI10 is only valid for orders ₹2000 or above.");
      }
    } else if (code === "freeship") {
      if (subtotal < 2000) {
        appliedDiscount = 0.05;
        setDiscount(appliedDiscount);
        successToast("✅ 5% discount applied!");
      } else {
        setDiscount(0);
        setPromoError("FREESHIP is only valid for orders below ₹2000.");
      }
    } else {
      setDiscount(0);
      setPromoError("Invalid promo code.");
    }
  };

  const handleCheckout = async () => {
    if (!userId) {
      errorToast("Please log in to proceed to checkout.");
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      errorToast("Your cart is empty.");
      return;
    }
    try {
      const res = await AxiosInstance.post(`/cart/checkout`, { userId, code: promoCode });
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
      errorToast("❌ Checkout failed.");
    }
  };

  const totalDiscount = subtotal * discount;
  const total = subtotal + shippingCost - totalDiscount;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-10 border-b border-gray-100 pb-6">
          <div className="bg-green-100 p-3 rounded-2xl text-green-600">
            <FaShoppingBag className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Cart</h1>
            <p className="text-gray-500 text-sm font-medium">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag</p>
          </div>
        </div>

        {!userId && (
          <div className="mb-8 p-5 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center gap-4 text-yellow-800 shadow-sm">
            <span className="text-xl">🔒</span>
            <p className="text-sm font-medium">
              You are not logged in. <button onClick={() => navigate('/login')} className="underline font-bold hover:text-yellow-900">Sign in</button> to see your saved items.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
             <p className="italic font-medium">Updating your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-gray-100 shadow-inner">
            <div className="text-6xl mb-6 opacity-30">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">Looks like you haven't added anything to your bag yet.</p>
            <Link to="/home">
              <Button className="bg-green-600 text-white px-10 py-3 rounded-xl font-bold shadow-md hover:bg-green-700 active:scale-95 transition-all">
                Explore Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Left Side - Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-100 p-8 rounded-[2.5rem] border border-gray-200 shadow-inner">
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 transition-all hover:shadow-md"
                    >
                      <div className="relative overflow-hidden rounded-xl bg-gray-50 w-full sm:w-32 h-32 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                              title="Remove item"
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide">REF: {item.sku || 'N/A'}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                          <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            <button 
                                onClick={() => updateQuantity(item.id, "dec")}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-500"
                            ><FaMinus className="text-xs" /></button>
                            <span className="font-bold text-gray-800 w-4 text-center">{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity(item.id, "inc")}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-500"
                            ><FaPlus className="text-xs" /></button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Total</p>
                            <span className="text-xl font-black text-green-600">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center text-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <FaShieldAlt className="text-green-600 text-xl" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure Checkout</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <FaTruck className="text-green-600 text-xl" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">↻</div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Right Side - Summary */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-24">
              <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Estimated Shipping</span>
                  <span className="text-gray-900">{shippingCost === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingCost}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Promo Applied</span>
                    <span>-₹{totalDiscount.toFixed()}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Estimated Total</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{total.toFixed()}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium pb-1">Tax included</p>
                </div>
              </div>

              {/* Promo Input */}
              <div className="space-y-3 mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Apply Promo Code</p>
                <div className="flex gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-green-300 transition-colors">
                  <input
                    type="text"
                    placeholder="Enter code..."
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-transparent px-3 py-1.5 outline-none font-medium text-sm"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors"
                  >Apply</button>
                </div>
                {promoError && <p className="text-red-500 text-[10px] font-bold px-1">{promoError}</p>}
                
                {/* Available Codes */}
                <div className="flex flex-wrap gap-2 pt-2">
                   {['DESI10', 'FREESHIP'].map(code => (
                     <span key={code} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-100 cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setPromoCode(code)}>
                       {code}
                     </span>
                   ))}
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-green-300 active:scale-[0.98] transition-all"
              >
                Checkout Now
              </Button>
              
              <p className="text-center text-[10px] text-gray-400 mt-6 font-medium">
                🔒 Secure SSL Encryption • GST Invoice Available
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-8 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12">
          <div>
            <h4 className="font-bold text-2xl mb-5 text-green-400">NicheNest</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              We connect artisans with customers who appreciate handmade craftsmanship. Empowering communities through art.
            </p>
            <div className="flex gap-5 text-2xl mt-6 text-gray-400">
              <a href="#" className="hover:text-green-400 transition-colors"><FaFacebook /></a>
              <a href="#" className="hover:text-green-400 transition-colors"><FaInstagram /></a>
              <a href="#" className="hover:text-green-400 transition-colors"><FaTwitter /></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-5 border-b border-gray-800 pb-2">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/categories/art-decor" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/offers" className="hover:text-white transition-colors">Special Offers</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">Help & Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-5 border-b border-gray-800 pb-2">Contact Us</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-center gap-2">📧 support@nichenest.com</p>
              <p className="flex items-center gap-2">📞 +91 98765 43210</p>
              <p className="flex items-center gap-2 pt-2">📍 New Delhi, India</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          © 2025 NicheNest. Celebrating handmade culture.
        </div>
      </footer>
    </div>
  );
}
