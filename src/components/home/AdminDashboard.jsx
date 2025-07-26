import React, { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import axios from "axios";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchArtisans(),
        fetchUsers(),
        fetchOrders()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debug: log users state
  useEffect(() => {
    console.log("✅ users state:", users);
  }, [users]);

  // Helper to extract array from API response
  const extractArray = (data, keyGuess) => {
    console.log("ExtractArray input:", data);
    console.log("ExtractArray keyGuess:", keyGuess);
    
    if (Array.isArray(data)) {
      console.log("Data is already an array, returning:", data);
      return data;
    }
    
    if (data && Array.isArray(data[keyGuess])) {
      console.log("Found array at key:", keyGuess, data[keyGuess]);
      return data[keyGuess];
    }
    
    // fallback: first array property
    if (data && typeof data === "object") {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          console.log("Found array at fallback key:", key, data[key]);
          return data[key];
        }
      }
    }
    
    console.log("No array found, returning empty array");
    return [];
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      console.log("Products API response:", res.data);
      setProducts(extractArray(res.data, "products"));
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchArtisans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/artisans");
      console.log("Artisans API response:", res.data);
      setArtisans(extractArray(res.data, "artisans"));
    } catch (err) {
      console.error("Failed to fetch artisans", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      console.log("Users API response:", res.data);
      setUsers(extractArray(res.data, "users"));
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      console.log("Orders API response:", res.data);
      console.log("Orders response type:", typeof res.data);
      console.log("Orders response is array:", Array.isArray(res.data));
      
      const ordersData = extractArray(res.data, "orders");
      console.log("Extracted orders:", ordersData);
      console.log("Orders count:", ordersData.length);
      console.log("Orders data type:", typeof ordersData);
      console.log("Orders data is array:", Array.isArray(ordersData));
      
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else if (Array.isArray(res.data)) {
        console.log("Response data is directly an array, using it");
        setOrders(res.data);
      } else {
        console.error("Orders data is not an array:", ordersData);
        console.error("Response data is also not an array:", res.data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setOrders([]);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const deleteArtisan = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/artisans/${id}`);
      fetchArtisans();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus
      });
      fetchOrders(); // Refresh orders after update
    } catch (err) {
      console.error("Order status update failed", err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Delete order failed", err);
    }
  };

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Calculate total sales (sum of all product quantities sold)
  const totalSales = orders.reduce((sum, order) => {
    if (Array.isArray(order.items)) {
      return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
    }
    return sum;
  }, 0);
  
  // Get recent orders (last 6, sorted by createdAt descending)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen font-sans bg-gray-50 text-gray-800">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800">
      <Navbar />

      {/* Header Section */}
      <section className="bg-green-700 text-white px-6 py-10 text-center rounded-b-2xl shadow-md">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-200 mt-2 text-lg">
          Manage products, orders, and users efficiently.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
          {[
            { icon: <FaBox />, label: "Total Products", value: products.length, color: "text-blue-600" },
            { icon: <FaUsers />, label: "Registered Users", value: users.length, color: "text-green-600" },
            { icon: <FaUsers />, label: "Total Artisans", value: artisans.length, color: "text-pink-600" },
            { icon: <FaShoppingCart />, label: "Total Orders", value: orders.length || 0, color: "text-purple-600" },
            { icon: <FaShoppingCart />, label: "Total Revenue", value: `₹${totalRevenue}` , color: "text-orange-600" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md border flex items-center gap-4 transition"
            >
              <div className={`${item.color} text-3xl`}>{item.icon}</div>
              <div>
                <p className="text-xl font-bold">{item.value}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Product Management */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">🛍️ Manage Products</h2>
            <Link to="/admin/add-product">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow">
                + Add New
              </button>
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="text-center">₹{product.price}</td>
                    <td className="text-center">{product.stock || 0}</td>
                    <td className="text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {product.stock > 0 ? "Active" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="text-center space-x-2">
                      <button
                        onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-600 hover:underline flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Artisan Management */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">👩‍🎨 Artisan Management</h2>
            <Link to="/admin/add-artisan">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow">
                + Add Artisan
              </button>
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3">Artisan Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Products Listed</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {artisans.map((artisan) => (
                  <tr key={artisan._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{artisan.name}</td>
                    <td>{artisan.email}</td>
                    <td className="text-center">{artisan.productsListed ?? 0}</td>
                    <td className="text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          artisan.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {artisan.status || "Inactive"}
                      </span>
                    </td>
                    <td className="text-center space-x-2">
                      <button
                        onClick={() => navigate(`/admin/edit-artisan/${artisan._id}`)}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => deleteArtisan(artisan._id)}
                        className="text-red-600 hover:underline flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Orders Quick View */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">🕒 Recent Orders</h2>
                          <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500"></span>
                <button 
                  onClick={fetchAllData}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  🔄 Refresh Now
                </button>
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOrders.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No recent orders found
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id} className="bg-white p-4 rounded-xl shadow border hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-sm text-gray-600">#{order._id?.slice(-8)}</p>
                      <p className="font-medium text-gray-800">
                        {order.user?.fullName || order.user?.name || 'Unknown Customer'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {(order.status && order.status.trim()) ? order.status : 'Pending'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                    <p className="font-semibold text-green-600">₹{order.totalAmount}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      Payment: {order.paymentStatus === 'Paid' ? 'Done' : 'Pending'}
                    </span>
                    <a
                      href={`http://localhost:5000/api/orders/${order._id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`invoice_${order._id}.pdf`}
                      className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                    >
                      Download Invoice (PDF)
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>


      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-20 rounded-t-3xl">
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
              <li><Link to="/categories" className="hover:underline">Categories</Link></li>
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