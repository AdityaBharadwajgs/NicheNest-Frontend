import React, { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { FaBox, FaUsers, FaShoppingCart, FaEdit, FaTrash, FaDownload, FaChartLine } from "react-icons/fa";
import AxiosInstance from "../../config/Api_call";
import { errorToast, successToast } from "../../plugins/toast";

const API = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

// ── SVG Line Chart ────────────────────────────────────────────────────────────
function LineChart({ data, label, color }) {
  if (!data || data.length < 2) return <p className="text-gray-400 text-sm text-center py-6">Not enough data</p>;
  const W = 500, H = 160, PAD = 30;
  const vals = data.map(d => d.value);
  const max = Math.max(...vals) || 1;
  const min = Math.min(...vals);
  const xStep = (W - PAD * 2) / (data.length - 1);
  const toY = v => H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2);
  const points = data.map((d, i) => `${PAD + i * xStep},${toY(d.value)}`).join(' ');
  const areaPoints = `${PAD},${H - PAD} ` + points + ` ${PAD + (data.length - 1) * xStep},${H - PAD}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={PAD} x2={W - PAD} y1={PAD + t * (H - PAD * 2)} y2={PAD + t * (H - PAD * 2)}
          stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {/* Area fill */}
      <polygon points={areaPoints} fill={`url(#grad-${label})`} />
      {/* Line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots + labels */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={PAD + i * xStep} cy={toY(d.value)} r="4" fill={color} />
          <text x={PAD + i * xStep} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── CSV Download ──────────────────────────────────────────────────────────────
function downloadCSV(orders) {
  const headers = ['Order ID', 'Customer', 'Items', 'Total Amount', 'Payment Status', 'Order Status', 'Date'];
  const rows = orders.map(o => [
    o._id,
    o.user?.fullName || o.user?.name || 'Unknown',
    o.items?.length || 0,
    o.totalAmount || 0,
    o.paymentStatus || 'Unpaid',
    o.status || 'Pending',
    new Date(o.createdAt).toLocaleDateString()
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NicheNest_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Build chart data from orders ──────────────────────────────────────────────
function buildChartData(orders, key) {
  const map = {};
  orders.forEach(o => {
    const date = new Date(o.createdAt);
    const label = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (!map[label]) map[label] = 0;
    map[label] += key === 'revenue' ? (o.totalAmount || 0) : 1;
  });
  return Object.entries(map).slice(-7).map(([label, value]) => ({ label, value }));
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchArtisans(), fetchUsers(), fetchOrders()]);
    setLoading(false);
  };

  const extractArray = (data, key) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data[key])) return data[key];
    if (data && typeof data === 'object') for (const k in data) if (Array.isArray(data[k])) return data[k];
    return [];
  };

  const fetchProducts = async () => {
    try { const r = await AxiosInstance.get('/products'); setProducts(extractArray(r.data, 'products')); } catch {}
  };
  const fetchArtisans = async () => {
    try { const r = await AxiosInstance.get('/artisans'); setArtisans(extractArray(r.data, 'artisans')); } catch {}
  };
  const fetchUsers = async () => {
    try { const r = await AxiosInstance.get('/users'); setUsers(extractArray(r.data, 'users')); } catch {}
  };
  const fetchOrders = async () => {
    try {
      const r = await AxiosInstance.get('/orders');
      const data = extractArray(r.data, 'orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
  };

  const deleteProduct = async (id) => {
    try { await AxiosInstance.delete(`/products/${id}`); successToast('Product deleted!'); fetchProducts(); } catch {}
  };
  const deleteArtisan = async (id) => {
    try { await AxiosInstance.delete(`/artisans/${id}`); successToast('Artisan deleted!'); fetchArtisans(); } catch {}
  };
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await AxiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
      successToast('Order status updated!');
      fetchOrders();
    } catch { errorToast('Failed to update status'); }
  };
  const deleteOrder = async (id) => {
    try { await AxiosInstance.delete(`/orders/${id}`); successToast('Order deleted!'); fetchOrders(); } catch {}
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid').length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const revenueData = buildChartData(orders, 'revenue');
  const ordersData = buildChartData(orders, 'orders');

  const stats = [
    { icon: <FaBox />, label: 'Products', value: products.length, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { icon: <FaUsers />, label: 'Users', value: users.length, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
    { icon: <FaUsers />, label: 'Artisans', value: artisans.length, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
    { icon: <FaShoppingCart />, label: 'Orders', value: orders.length, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
    { icon: <FaChartLine />, label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white px-6 py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-green-100 mt-1 text-sm">Manage your store — products, orders, artisans & reports</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl border ${s.border} p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition`}>
              <div className={`${s.color} text-2xl p-3 rounded-xl`}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts + Reports ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 col-span-1">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaChartLine className="text-emerald-500" /> Revenue (Last 7 Days)
            </h3>
            <LineChart data={revenueData} label="revenue" color="#10b981" />
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 col-span-1">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaShoppingCart className="text-blue-500" /> Orders (Last 7 Days)
            </h3>
            <LineChart data={ordersData} label="orders" color="#3b82f6" />
          </div>

          {/* Reports Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <FaDownload className="text-purple-500" /> Reports
              </h3>
              <p className="text-xs text-gray-500 mb-4">Download order and revenue summaries as CSV.</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold">{orders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid Orders</span>
                  <span className="font-semibold text-green-600">{paidOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-emerald-600">₹{totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => downloadCSV(orders)}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-xl transition"
            >
              <FaDownload /> Download Report (CSV)
            </button>
          </div>
        </div>

        {/* ── Recent Orders ── */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🕒 Recent Orders</h2>
            <button onClick={fetchAllData} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
              🔄 Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOrders.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-400">No orders yet</div>
            ) : recentOrders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-mono text-xs text-gray-400">#{order._id?.slice(-8)}</p>
                    <p className="font-semibold text-sm text-gray-800">
                      {order.user?.fullName || order.user?.name || 'Unknown'}
                    </p>
                  </div>
                  <select
                    value={order.status || 'Pending'}
                    onChange={e => updateOrderStatus(order._id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${
                      order.status === 'Delivered'  ? 'bg-green-100 text-green-700 border-green-200' :
                      order.status === 'Shipped'    ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      order.status === 'Cancelled'  ? 'bg-red-100 text-red-600 border-red-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-500">{order.items?.length || 0} item(s)</span>
                  <span className="font-bold text-emerald-600">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.paymentStatus === 'Paid' ? 'Paid ✓' : 'Unpaid'}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href={`${API}/orders/${order._id}/invoice`}
                    target="_blank" rel="noopener noreferrer"
                    download={`invoice_${order._id}.pdf`}
                    className="flex-1 text-center text-xs bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition"
                  >
                    📄 Invoice
                  </a>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Products ── */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🛍️ Products</h2>
            <Link to="/admin/add-product">
              <button className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition">+ Add Product</button>
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="min-w-full text-sm divide-y divide-gray-100">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-center">Price</th>
                  <th className="px-5 py-3 text-center">Stock</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3 text-center text-gray-700">₹{p.price}</td>
                    <td className="px-5 py-3 text-center">{p.stock || 0}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {p.stock > 0 ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => navigate(`/admin/edit-product/${p._id}`)} className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1">
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => deleteProduct(p._id)} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Artisans ── */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">👩‍🎨 Artisans</h2>
            <Link to="/admin/add-artisan">
              <button className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition">+ Add Artisan</button>
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="min-w-full text-sm divide-y divide-gray-100">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-center">Email</th>
                  <th className="px-5 py-3 text-center">Products</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {artisans.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium">{a.name}</td>
                    <td className="px-5 py-3 text-center text-gray-500">{a.email}</td>
                    <td className="px-5 py-3 text-center">{a.productsListed ?? 0}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        a.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {a.status || 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => navigate(`/admin/edit-artisan/${a._id}`)} className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1">
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => deleteArtisan(a._id)} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6 mt-10 text-center text-sm text-gray-400">
        © 2025 NicheNest · Admin Panel
      </footer>
    </div>
  );
}
