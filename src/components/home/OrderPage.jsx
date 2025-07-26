import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "../reusable/Button";
import { FaCheckCircle, FaTruck, FaCreditCard, FaShieldAlt, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import AxiosInstance from "../../config/Api_call";

function getShipping(subtotal) {
  return subtotal >= 999 ? 0 : 30;
}

function getEstimatedDelivery() {
  const today = new Date();
  const min = new Date(today);
  const max = new Date(today);
  min.setDate(today.getDate() + 3);
  max.setDate(today.getDate() + 5);
  return `${min.toLocaleDateString()} - ${max.toLocaleDateString()}`;
}

function getEstimatedDeliveryDate() {
  const today = new Date();
  const min = new Date(today);
  min.setDate(today.getDate() + 3);
  return min.toISOString();
}

function generateOrderId() {
  return "DESI" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
}

function generateTrackingId() {
  return "TRK" + Math.floor(100000 + Math.random() * 900000);
}

function getOrderTimeline(trackingStatus) {
  const today = new Date();
  const placed = today.toLocaleDateString();
  const processed = new Date(today);
  processed.setDate(today.getDate() + 1);
  const shipped = new Date(today);
  shipped.setDate(today.getDate() + 2);
  const delivered = new Date(today);
  delivered.setDate(today.getDate() + 4);
  return [
    { label: "Order Placed", date: placed, status: "done", icon: "✓" },
    { label: "Order Processed", date: processed.toLocaleDateString(), status: trackingStatus === 'Processed' || trackingStatus === 'Shipped' || trackingStatus === 'Delivered' ? "done" : "pending", icon: "✓" },
    { label: "Shipped", date: shipped.toLocaleDateString(), status: trackingStatus === 'Shipped' || trackingStatus === 'Delivered' ? "done" : "pending", icon: "🚚" },
    { label: "Estimated Delivery", date: delivered.toLocaleDateString(), status: trackingStatus === 'Delivered' ? "done" : "pending", icon: "📦" },
  ];
}

// Add a helper to check expiry
function isExpiryValid(expiry) {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const [mm, yy] = expiry.split('/').map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
}

export default function OrderPage() {
  const location = useLocation();
  const product = location.state?.product;
  const cartItems = location.state?.cartItems;
  const isFromCart = location.state?.isFromCart;
  const [activeTab, setActiveTab] = useState("order");
  const [paymentMethod, setPaymentMethod] = useState("Credit/Debit Card");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [trackingId] = useState(generateTrackingId());
  const [trackingStatus] = useState("Processed"); // Could be dynamic
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    upiId: '' // Added upiId to cardDetails
  });
  const [cardError, setCardError] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [confirmedPaymentStatus, setConfirmedPaymentStatus] = useState("");
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Add new state for field-specific errors
  const [fieldErrors, setFieldErrors] = useState({ number: '', expiry: '', cvv: '', name: '', upiId: '' });

  // Get logged-in user from localStorage
  const loggedinUser = JSON.parse(localStorage.getItem('loggedinUser')) || {};

  // Add a placeholder QR code image URL
  const DUMMY_QR_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=demo@upi&pn=Demo+Merchant&am=100';

  // Handle order confirmation
  const handleOrderConfirmation = async (paymentStatus) => {
    try {
      // Prepare order data
      let orderData;
      if (isFromCart && cartItems) {
        orderData = {
          userId: loggedinUser._id,
          items: cartItems.map(item => ({ product: item._id || item.id, quantity: item.quantity || 1 })),
          shippingAddress: "123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001", // Replace with real address
          paymentStatus: paymentStatus,
          status: "Pending",
          trackingId,
          deliveryDate: getEstimatedDeliveryDate(),
          invoiceGenerated: false,
        };
      } else if (product) {
        orderData = {
          userId: loggedinUser._id,
          items: [{ product: product._id || product.id, quantity: 1 }],
          shippingAddress: "123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001", // Replace with real address
          paymentStatus: paymentStatus,
          status: "Pending",
          trackingId,
          deliveryDate: getEstimatedDeliveryDate(),
          invoiceGenerated: false,
        };
      }

      // Call backend to create order
      await AxiosInstance.post("/orders", orderData);
      
      // Update UI state
      const newOrderId = generateOrderId();
      setConfirmedOrderId(newOrderId);
      setConfirmedPaymentStatus(paymentStatus === "Unpaid" ? "Not Paid" : "Paid");
      setOrderConfirmed(true);
    } catch (err) {
      if (err.message && (err.message.includes('Network Error') || err.message.includes('ERR_CONNECTION_REFUSED') || err.message.includes('ERR_CONNECTION_RESET'))) {
        alert("Order failed: Unable to connect to backend. Please ensure your backend server and MongoDB are running.\n\n1. Start MongoDB (mongod)\n2. Start backend: npm run dev in Niche_Ecommerce-BE\n3. Try again.");
      } else {
        alert("Order failed: " + (err.response?.data?.error || err.message));
      }
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentResult) => {
    setPaymentResult(paymentResult);
    handleOrderConfirmation("Paid");
  };

  // Handle payment failure
  const handlePaymentFailure = (error) => {
    console.error("Payment failed:", error);
    // Payment failed, but order can still be created with unpaid status
    // handleOrderConfirmation("Unpaid");
  };

  // Handle cart checkout
  if (isFromCart && cartItems) {
    const subtotal = location.state.subtotal || cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = location.state.shipping || getShipping(subtotal);
    const discount = location.state.discount || 0;
    const total = location.state.total || (subtotal + shipping - discount);
    const orderId = generateOrderId();
    const delivery = getEstimatedDelivery();
    const paymentStatus = "Paid";
    const timeline = getOrderTimeline(trackingStatus);

    // Show payment method selection if not confirmed
    if (!orderConfirmed) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Select Payment Method</h2>
            <div className="mb-6">
              <select
                value={paymentMethod}
                onChange={e => {
                  setPaymentMethod(e.target.value);
                  setCardError('');
                }}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Credit/Debit Card">Credit/Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
            {/* Payment Method Details */}
            {paymentMethod === 'Credit/Debit Card' && (
              <div className="mb-6 space-y-3 text-left">
                <input
                  type="text"
                  placeholder="Enter 16-digit card number"
                  value={cardDetails.number}
                  maxLength={16}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setCardDetails({ ...cardDetails, number: value });
                    setFieldErrors({ ...fieldErrors, number: '' });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none"
                />
                {fieldErrors.number && <p className="text-red-600 text-sm">{fieldErrors.number}</p>}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY (e.g., 12/25)"
                    value={cardDetails.expiry}
                    maxLength={5}
                    onChange={e => {
                      setCardDetails({ ...cardDetails, expiry: e.target.value.replace(/[^0-9\/]/g, '') });
                      setFieldErrors({ ...fieldErrors, expiry: '' });
                    }}
                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="3-digit CVV"
                    value={cardDetails.cvv}
                    maxLength={3}
                    onChange={e => {
                      setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, '') });
                      setFieldErrors({ ...fieldErrors, cvv: '' });
                    }}
                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none"
                  />
                </div>
                {fieldErrors.expiry && <p className="text-red-600 text-sm">{fieldErrors.expiry}</p>}
                {fieldErrors.cvv && <p className="text-red-600 text-sm">{fieldErrors.cvv}</p>}
                <input
                  type="text"
                  placeholder="Name as on card"
                  value={cardDetails.name}
                  onChange={e => {
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setCardDetails({ ...cardDetails, name: value });
                    setFieldErrors({ ...fieldErrors, name: '' });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none"
                />
                {fieldErrors.name && <p className="text-red-600 text-sm">{fieldErrors.name}</p>}
                {cardError && <p className="text-red-600 text-sm">{cardError}</p>}
              </div>
            )}
            {paymentMethod === 'UPI' && (
              <div className="mb-6 space-y-3 text-left">
                <input
                  type="text"
                  placeholder="Enter your UPI ID (e.g., name@upi)"
                  value={cardDetails.upiId || ''}
                  onChange={e => {
                    setCardDetails({ ...cardDetails, upiId: e.target.value });
                    setFieldErrors({ ...fieldErrors, upiId: '' });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none"
                />
                {fieldErrors.upiId && <p className="text-red-600 text-sm">{fieldErrors.upiId}</p>}
                {/* Dummy QR code and Simulate Payment button */}
                <div className="flex flex-col items-center gap-2 mt-4">
                  <img src={DUMMY_QR_URL} alt="UPI QR Code" className="w-36 h-36 border rounded-lg" />
                  <span className="text-gray-600 text-sm">Scan this QR with any UPI app</span>
                  <Button
                    className="bg-green-600 text-white mt-2"
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        // Prepare order data
                        let orderData;
                        if (isFromCart && cartItems) {
                          orderData = {
                            userId: loggedinUser._id,
                            items: cartItems.map(item => ({ product: item._id || item.id, quantity: item.quantity || 1 })),
                            shippingAddress: "123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001",
                            paymentStatus: "Paid",
                            status: "Pending",
                            trackingId,
                            deliveryDate: getEstimatedDeliveryDate(),
                            invoiceGenerated: false,
                          };
                        } else if (product) {
                          orderData = {
                            userId: loggedinUser._id,
                            items: [{ product: product._id || product.id, quantity: 1 }],
                            shippingAddress: "123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001",
                            paymentStatus: "Paid",
                            status: "Pending",
                            trackingId,
                            deliveryDate: getEstimatedDeliveryDate(),
                            invoiceGenerated: false,
                          };
                        }
                        await AxiosInstance.post("/orders", orderData);
                        const newOrderId = generateOrderId();
                        setConfirmedOrderId(newOrderId);
                        setConfirmedPaymentStatus("Paid");
                        setOrderConfirmed(true);
                      } catch (err) {
                        alert("Order failed: " + (err.response?.data?.error || err.message));
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Simulate Payment'}
                  </Button>
                </div>
              </div>
            )}
            {paymentMethod === 'Cash on Delivery' && (
              <div className="mb-6 text-green-700 font-semibold text-center">
                Please pay the amount after receiving your order.
              </div>
            )}
            <Button
              className="bg-green-600 text-white w-full flex items-center justify-center gap-2"
              onClick={async () => {
                if (paymentMethod === 'Credit/Debit Card') {
                  let errors = { number: '', expiry: '', cvv: '', name: '', upiId: '' };
                  let valid = true;
                  if (!cardDetails.number || cardDetails.number.length !== 16) {
                    errors.number = 'Card number must be 16 digits.';
                    valid = false;
                  }
                  if (!cardDetails.expiry || !isExpiryValid(cardDetails.expiry)) {
                    errors.expiry = 'Please enter a valid expiry date (MM/YY).';
                    valid = false;
                  }
                  if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
                    errors.cvv = 'CVV must be 3 digits.';
                    valid = false;
                  }
                  if (!cardDetails.name || /\d/.test(cardDetails.name) || cardDetails.name.length < 2) {
                    errors.name = 'Name on card should only contain letters and spaces.';
                    valid = false;
                  }
                  setFieldErrors(errors);
                  if (!valid) {
                    alert('Please keep all fields required for Credit/Debit Card payment.');
                    return;
                  }
                  setIsProcessing(true);
                  try {
                    // Prepare order data
                    let orderData;
                    if (isFromCart && cartItems) {
                      orderData = {
                        userId: loggedinUser._id,
                        items: cartItems.map(item => ({ product: item._id || item.id, quantity: item.quantity || 1 })),
                        shippingAddress: "123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001", // Replace with real address
                        paymentStatus: "Paid",
                        status: "Pending",
                        trackingId,
                        deliveryDate: getEstimatedDeliveryDate(),
                        invoiceGenerated: false,
                      };
                    } else if (product) {
                      orderData = {
                        userId: loggedinUser._id,
                        items: [{ product: product._id || product.id, quantity: 1 }],
                        shippingAddress: "123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001", // Replace with real address
                        paymentStatus: "Paid",
                        status: "Pending",
                        trackingId,
                        deliveryDate: getEstimatedDeliveryDate(),
                        invoiceGenerated: false,
                      };
                    }
                    // Call backend to create order
                    await AxiosInstance.post("/orders", orderData);
                    // Now update UI state as before
                    const newOrderId = generateOrderId();
                    setConfirmedOrderId(newOrderId);
                    setConfirmedPaymentStatus("Paid");
                    setOrderConfirmed(true);
                  } catch (err) {
                    alert("Order failed: " + (err.response?.data?.error || err.message));
                  } finally {
                    setIsProcessing(false);
                  }
                } else if (paymentMethod === 'UPI') {
                  let errors = { number: '', expiry: '', cvv: '', name: '', upiId: '' };
                  let valid = true;
                  if (!cardDetails.upiId || cardDetails.upiId.trim() === '') {
                    errors.upiId = 'Please enter your UPI ID or scan the QR code to proceed.';
                    valid = false;
                  }
                  setFieldErrors(errors);
                  if (!valid) {
                    alert('Please keep all fields required for UPI payment.');
                    return;
                  }
                  // If UPI ID is provided, proceed with order
                  setIsProcessing(true);
                  try {
                    // Prepare order data
                    let orderData;
                    if (isFromCart && cartItems) {
                      orderData = {
                        userId: loggedinUser._id,
                        items: cartItems.map(item => ({ product: item._id || item.id, quantity: item.quantity || 1 })),
                        shippingAddress: "123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001",
                        paymentStatus: "Paid",
                        status: "Pending",
                        trackingId,
                        deliveryDate: getEstimatedDeliveryDate(),
                        invoiceGenerated: false,
                      };
                    } else if (product) {
                      orderData = {
                        userId: loggedinUser._id,
                        items: [{ product: product._id || product.id, quantity: 1 }],
                        shippingAddress: "123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001",
                        paymentStatus: "Paid",
                        status: "Pending",
                        trackingId,
                        deliveryDate: getEstimatedDeliveryDate(),
                        invoiceGenerated: false,
                      };
                    }
                    await AxiosInstance.post("/orders", orderData);
                    const newOrderId = generateOrderId();
                    setConfirmedOrderId(newOrderId);
                    setConfirmedPaymentStatus("Paid");
                    setOrderConfirmed(true);
                  } catch (err) {
                    alert("Order failed: " + (err.response?.data?.error || err.message));
                  } finally {
                    setIsProcessing(false);
                  }
                } else if (paymentMethod === 'Cash on Delivery') {
                  handleOrderConfirmation("Unpaid");
                }
              }}
              disabled={isProcessing || 
                (paymentMethod === 'Credit/Debit Card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name || !isExpiryValid(cardDetails.expiry))) ||
                (paymentMethod === 'UPI' && (!cardDetails.upiId || cardDetails.upiId.trim() === ''))
              }
            >
              {isProcessing && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
              {isProcessing ? 'Processing...' : 'Confirm Order'}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-600 text-2xl" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Order Confirmation</h1>
                  <p className="text-sm text-gray-600">Order #{confirmedOrderId}</p>
                </div>
              </div>
              <Link to="/home">
                <Button className="bg-green-600 text-white">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FaCheckCircle className="text-green-600 text-2xl" />
                  <h2 className="text-xl font-bold text-green-800">Thank you for your order!</h2>
                </div>
                <p className="text-green-700 mb-2">Your order has been successfully placed and confirmed.</p>
                <p className="text-sm text-green-600">We'll send you email and SMS updates as your order progresses.</p>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaTruck className="text-blue-600" />
                  Order Status
                </h3>
                <div className="space-y-4">
                  {timeline.map((step, idx) => (
                    <div key={step.label} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.status === "done" 
                          ? "bg-green-600 text-white" 
                          : "bg-gray-200 text-gray-500"
                      }`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.status === "done" ? "text-green-700" : "text-gray-500"}`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-gray-400">{step.date}</p>
                      </div>
                      {step.status === "done" && (
                        <FaCheckCircle className="text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
                {/* Tracking Details */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm font-semibold">Tracking ID: <span className="font-mono">{trackingId}</span></p>
                  <p className="text-blue-700 text-sm">Status: {trackingStatus}</p>
                  <Link
                    to={`/track-order/${trackingId}`}
                    className="text-blue-600 underline text-xs mt-1 inline-block"
                  >
                    Track your order online
                  </Link>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.sku || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Delivery: {item.estDelivery || '2-4 days'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">₹{item.price}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-semibold text-green-600">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-600" />
                  Delivery Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>John Doe</p>
                      <p>123 Main Street, Apartment 4B</p>
                      <p>Mumbai, Maharashtra 400001</p>
                      <p>India</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Delivery Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Estimated Delivery:</strong> {delivery}</p>
                      <p><strong>Shipping Method:</strong> Standard Delivery</p>
                      <p><strong>Tracking:</strong> <span className="font-mono">{trackingId}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaCreditCard className="text-blue-600" />
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Payment Method</span>
                    <span>{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <span className={confirmedPaymentStatus === "Paid" ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>{confirmedPaymentStatus}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Order ID</span>
                    <span className="font-mono">{confirmedOrderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tracking ID</span>
                    <span className="font-mono">{trackingId}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaShieldAlt className="text-green-600" />
                    <span>Secure payment processed</span>
                  </div>
                </div>
              </div>

              {/* Customer Support */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <FaPhone className="text-green-600" />
                    <div>
                      <p className="font-medium">Call Us</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FaEnvelope className="text-green-600" />
                    <div>
                      <p className="font-medium">Email Support</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Return Policy:</strong> 7-day easy returns with full refund
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle single product purchase
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-green-700">Order placed successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your order!</p>
          <Link to="/home">
            <Button className="bg-green-600 text-white">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = product.price;
  const shipping = getShipping(subtotal);
  const total = subtotal + shipping;
  const orderId = generateOrderId();
  const delivery = getEstimatedDelivery();
  const paymentStatus = "Paid";
  const timeline = getOrderTimeline(trackingStatus);
  const paymentMethodDisplay = paymentMethod + (paymentMethod === "Credit/Debit Card" ? " (**** 1234)" : "");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-600 text-2xl" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Order Confirmation</h1>
                <p className="text-sm text-gray-600">Order #{orderId}</p>
              </div>
            </div>
            <Link to="/home">
              <Button className="bg-green-600 text-white">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <FaCheckCircle className="text-green-600 text-2xl" />
                <h2 className="text-xl font-bold text-green-800">Thank you for your purchase!</h2>
              </div>
              <p className="text-green-700 mb-2">Your order has been successfully placed and confirmed.</p>
              <p className="text-sm text-green-600">We'll send you email updates as your order progresses.</p>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaTruck className="text-blue-600" />
                Order Status
              </h3>
              <div className="space-y-4">
                {timeline.map((step, idx) => (
                  <div key={step.label} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === "done" 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.status === "done" ? "text-green-700" : "text-gray-500"}`}>
                        {step.label}
                      </p>
                      <p className="text-sm text-gray-400">{step.date}</p>
                    </div>
                    {step.status === "done" && (
                      <FaCheckCircle className="text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{product.name}</h4>
                  <p className="text-sm text-gray-600">Category: {product.category}</p>
                  <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">₹{product.price}</p>
                  <p className="text-sm text-gray-600">Qty: 1</p>
                  <p className="font-semibold text-green-600">₹{product.price}</p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-600" />
                Delivery Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>John Doe</p>
                    <p>123 Main Street, Apartment 4B</p>
                    <p>Mumbai, Maharashtra 400001</p>
                    <p>India</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Delivery Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Estimated Delivery:</strong> {delivery}</p>
                    <p><strong>Shipping Method:</strong> Standard Delivery</p>
                    <p><strong>Tracking:</strong> Will be available once shipped</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal (1 item)</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaCreditCard className="text-blue-600" />
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Payment Method</span>
                  <span>{paymentMethodDisplay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <span className="text-green-600 font-semibold">{paymentStatus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Order ID</span>
                  <span className="font-mono">{orderId}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaShieldAlt className="text-green-600" />
                  <span>Secure payment processed</span>
                </div>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <FaPhone className="text-green-600" />
                  <div>
                    <p className="font-medium">Call Us</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FaEnvelope className="text-green-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Return Policy:</strong> 7-day easy returns with full refund
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 