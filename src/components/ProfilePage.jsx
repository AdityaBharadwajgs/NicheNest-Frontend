import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/navbar/Navbar";
import {
  FaHeart,
  FaShoppingBag,
  FaMapMarkedAlt,
  FaLock,
  FaClock,
  FaUser,
  FaFileDownload,
  FaTrash,
} from "react-icons/fa";

import profileBanner from "../assets/Images/banner.jpg";
import defaultAvatar from "../assets/Images/user.png";
import product1 from "../assets/Images/Wooden Bowl.jpg";

const API = "http://localhost:5000/api";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "", location: "" });
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [newAddress, setNewAddress] = useState({ street: "", city: "", state: "", country: "", pincode: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef();
  const { loggedinUser } = useSelector(store => store.loggedinUser);
  const [hiddenOrders, setHiddenOrders] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { "Content-Type": "application/json" };
      const [userRes, ordersRes, wishlistRes, addressRes, activityRes] = await Promise.all([
        fetch(`${API}/users/${loggedinUser._id}`, { headers }),
        fetch(`${API}/users/${loggedinUser._id}/orders`, { headers }),
        fetch(`${API}/users/${loggedinUser._id}/wishlist`, { headers }),
        fetch(`${API}/users/${loggedinUser._id}/addresses`, { headers }),
        fetch(`${API}/users/${loggedinUser._id}/activity`, { headers }),
      ]);

      const userData = await userRes.json();
      setUserInfo({
        name: userData.name || userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        location: userData.city || "",
      });
      if (userData.avatar) setAvatar(userData.avatar);

      setOrders(await ordersRes.json());
      setWishlist(await wishlistRes.json());

      const addressData = await addressRes.json();
      setAddresses(Array.isArray(addressData) ? addressData : []);

      const activityData = await activityRes.json();
      setActivityLog(Array.isArray(activityData) ? activityData : []);
    } catch (err) {
      console.error("❌ Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loggedinUser || !loggedinUser._id) return;
    fetchData();
    // eslint-disable-next-line
  }, [loggedinUser]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        city: userInfo.location,
        avatar,
      };

      const res = await fetch(`${API}/users/${loggedinUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error();

      setUserInfo({
        name: updated.name || updated.fullName || "",
        email: updated.email || "",
        phone: updated.phone || "",
        location: updated.city || "",
      });
      if (updated.avatar) setAvatar(updated.avatar);
      alert("✅ Profile updated");
      setActivityLog((prev = []) => [
        { action: "Updated profile info", date: new Date() },
        ...prev,
      ]);
    } catch {
      alert("❌ Failed to update profile");
    }
  };

  const handleAddAddress = async () => {
    const { street, city, state, country, pincode } = newAddress;
    if ([street, city, state, country, pincode].some((v) => !v.trim())) return alert("⚠️ Please fill all fields");

    try {
      const res = await fetch(`${API}/users/${loggedinUser._id}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ street, city, state, country, pincode }),
      });

      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
      setNewAddress({ street: "", city: "", state: "", country: "", pincode: "" });
      alert("✅ Address added");
      setActivityLog((prev) => [{ action: "Added a new address", date: new Date() }, ...prev]);
    } catch {
      alert("❌ Failed to add address");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return alert("⚠️ Passwords don't match");

    try {
      const res = await fetch(`${API}/users/${loggedinUser._id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const response = await res.json();
      if (res.ok) {
        alert("✅ Password updated");
        setPasswords({ current: "", new: "", confirm: "" });
        setActivityLog((prev) => [{ action: "Changed password", date: new Date() }, ...prev]);
      } else alert(response.error || "❌ Update failed");
    } catch {
      alert("❌ Error updating password");
    }
  };

  const handleBuyNow = async (productId) => {
    try {
      console.log("Moving product to orders:", productId);
      
      const moveRes = await fetch(`${API}/users/${loggedinUser._id}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      
      if (moveRes.ok) {
        const responseData = await moveRes.json();
        console.log("Move to orders response:", responseData);
        
        // Update wishlist and orders from the response
        setWishlist(responseData.wishlist || []);
        setOrders(responseData.orders || []);
        
        alert("✅ Product moved to orders successfully!");
        setActivityLog((prev) => [{ action: "Moved item from wishlist to orders", date: new Date() }, ...prev]);
      } else {
        const errorData = await moveRes.json();
        console.error("Move to orders error:", errorData);
        alert(`❌ Could not move to orders: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error moving to orders:", error);
      alert("❌ Could not move to orders");
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      console.log("Removing product from wishlist:", productId);
      
      const res = await fetch(`${API}/users/${loggedinUser._id}/wishlist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      
      if (res.ok) {
        const updatedWishlist = await res.json();
        console.log("Updated wishlist after removal:", updatedWishlist);
        setWishlist(updatedWishlist);
        
        alert("✅ Product removed from wishlist!");
        setActivityLog((prev) => [{ action: "Removed item from wishlist", date: new Date() }, ...prev]);
      } else {
        const errorData = await res.json();
        console.error("Remove from wishlist error:", errorData);
        alert(`❌ Could not remove from wishlist: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("❌ Could not remove from wishlist");
    }
  };

  const handleDownloadInvoice = async (orderId, productName) => {
    try {
      const res = await fetch(`${API}/orders/${orderId}/invoice`, {
        method: "GET",
        headers: { "Accept": "application/pdf" },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        // Sanitize product name for filename
        const safeName = productName ? productName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '') : `invoice-${orderId.slice(-8)}`;
        a.href = url;
        a.download = `${safeName}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert("✅ Invoice downloaded successfully!");
      } else {
        alert("❌ Could not download invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("❌ Could not download invoice");
    }
  };

  const handleRemoveOrder = (orderId) => {
    setHiddenOrders(prev => [...prev, orderId]);
  };

  const renderInputFields = (fields, state, setState) => fields.map((field) => (
    <input
      key={field}
      type="text"
      placeholder={field}
      className="w-full px-4 py-2 bg-gray-700 text-white rounded mb-2"
      value={state[field] || ""}
      onChange={(e) => setState({ ...state, [field]: e.target.value })}
    />
  ));

  const renderAddresses = () =>
    Array.isArray(addresses)
      ? addresses.map((addr, i) => (
        <div key={i} className="border border-gray-700 p-4 rounded">
          <p>{addr.street}, {addr.city}, {addr.state}, {addr.country}{addr.pincode ? `, Pincode: ${addr.pincode}` : ""}</p>
        </div>
      ))
      : <p>No valid address data found.</p>;

  if (!loggedinUser || !loggedinUser._id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <div className="h-60 bg-cover bg-center relative" style={{ backgroundImage: `url(${profileBanner})` }}>
        <div className="absolute inset-0 bg-black/60" />
        <h1 className="relative z-10 flex items-center justify-center h-full text-3xl md:text-4xl font-bold">
          My Profile
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-green-600 cursor-pointer" onClick={() => fileInputRef.current.click()} />
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div>
            <h2 className="text-xl font-semibold">{userInfo.name || loggedinUser.fullName || loggedinUser.name}</h2>
            <p className="text-sm text-gray-400">{userInfo.email || loggedinUser.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            {["profile", "orders", "wishlist", "address", "security", "activity"].map((key, idx) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg w-full text-left font-medium transition-all ${activeTab === key ? "bg-green-600 text-white" : "hover:bg-green-800 text-gray-300"}`}
              >
                {[<FaUser />, <FaShoppingBag />, <FaHeart />, <FaMapMarkedAlt />, <FaLock />, <FaClock />][idx]} {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <div className="md:col-span-3 space-y-8">
            {activeTab === "profile" && (
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Update Profile Info</h3>
                {renderInputFields(["name", "email", "phone", "location"], userInfo, setUserInfo)}
                <button onClick={handleSaveProfile} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded">Save Profile</button>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">My Orders</h3>
                {orders.length === 0 ? (
                  <p>No orders found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {orders.filter(ord => !hiddenOrders.includes(ord._id)).map((ord) => (
                      <div key={ord._id} className="border border-gray-700 rounded-xl bg-gray-900">
                        <div className="p-4">
                          <p className="font-medium text-lg">Order #{ord._id?.toString().slice(-8)}</p>
                          <p className="text-sm text-gray-400 mb-2">Placed on: {new Date(ord.createdAt).toLocaleDateString()}</p>
                          <div className="grid grid-cols-1 gap-4">
                            {ord.items?.map((item, idx) => (
                              <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  src={item.product?.image || product1}
                                  className="w-full h-32 object-cover"
                                  alt={item.product?.name}
                                />
                                <div className="p-3">
                                  <h4 className="font-medium text-sm mb-1 truncate text-white">{item.product?.name}</h4>
                                  <p className="text-xs text-gray-400 mb-1">{item.product?.category}</p>
                                  <p className="text-sm font-semibold text-green-500 mb-2">₹{item.product?.price}</p>
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      className="p-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                                      title="Download Invoice"
                                      onClick={() => handleDownloadInvoice(ord._id, item.product?.name)}
                                    >
                                      <FaFileDownload size={16} />
                                    </button>
                                    <button
                                      className="p-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
                                      title="Remove"
                                      onClick={() => handleRemoveOrder(ord._id)}
                                    >
                                      <FaTrash size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Wishlist</h3>
                {wishlist.length === 0 ? (
                  <p>No wishlist items found.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {wishlist.map((item) => (
                      <div key={item.product?._id} className="border border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <img 
                          src={item.product?.image || product1} 
                          className="w-full h-32 object-cover" 
                          alt={item.product?.name}
                        />
                        <div className="p-3">
                          <h4 className="font-medium text-sm mb-1 truncate">{item.product?.name}</h4>
                          <p className="text-xs text-gray-400 mb-1">{item.product?.category}</p>
                          <p className="text-sm font-semibold text-green-500 mb-2">₹{item.product?.price}</p>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleBuyNow(item.product?._id)} 
                              className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            >
                              Buy
                            </button>
                            <button 
                              onClick={() => handleRemoveFromWishlist(item.product?._id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "address" && (
              <div className="bg-gray-800 p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-semibold mb-4">My Addresses</h3>
                {renderAddresses()}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {renderInputFields(["street", "city", "state", "country", "pincode"], newAddress, setNewAddress)}
                </div>
                <button onClick={handleAddAddress} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg">+ Add Address</button>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Account Security</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {renderInputFields(["current", "new", "confirm"], passwords, setPasswords)}
                  <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg">Update Password</button>
                </form>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Recent Activity (Last 6)</h3>
                {activityLog.length === 0 ? (
                  <p>No recent activity found.</p>
                ) : (
                  <ul className="space-y-3">
                    {activityLog.slice(0, 6).map((act, i) => (
                      <li key={i} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-200">{act.action}</p>
                          {act.date && (
                            <p className="text-xs text-gray-400">
                              {new Date(act.date).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;