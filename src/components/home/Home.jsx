// src/pages/HomePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../reusable/Button";
import { Input } from "../reusable/Input";
import Navbar from "../navbar/Navbar";
import { FaStar, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import TestimonialsSlider from "../home/TestimonialsSlider";
import heroBg from "../../assets/Images/banner.jpg";
import AxiosInstance from "../../config/Api_call";

const featuredProducts = [
  {
    id: 1,
    name: "Handcrafted Terracotta Vase",
    category: "Home Decor",
    price: 499,
    description: "Beautiful terracotta vase handmade by artisans.",
    image: "https://i.ibb.co/xtxxjgt5/Terracotta-Vase.jpg",
  },
  {
    id: 2,
    name: "Cotton Cushion Cover",
    category: "Textiles",
    price: 699,
    description: "Intricately embroidered cotton cushion cover.",
    image: "https://i.ibb.co/ZpmLrm4S/Cotton-Cushion-Cover.jpg",
  },
  {
    id: 3,
    name: "Wooden Jewellery Box",
    category: "Accessories",
    price: 999,
    description: "Elegant handcrafted wooden jewellery box.",
    image: "https://i.ibb.co/v61Kp11j/Wooden-Jewelry-Box.jpg",
  },
  {
    id: 4,
    name: "Woolen Shawl",
    category: "Clothing",
    price: 1499,
    description: "Cozy woolen shawl handwoven in Kashmir.",
    image: "https://i.ibb.co/TMx6Bk7N/Woolen-Shawl.jpg",
  },
  {
    id: 5,
    name: "Brass Lamp",
    category: "Lighting",
    price: 799,
    description: "Traditional brass lamp for home décor.",
    image: "https://i.ibb.co/SXs7QMJ5/Brass-Lamp.jpg",
  },
  {
    id: 6,
    name: "Block Print Fabric",
    category: "Textiles",
    price: 599,
    description: "Eco-friendly hand block printed fabric.",
    image: "https://i.ibb.co/zVFFK75w/Block-Print-Fabric.jpg",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('user');

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      const res = await AxiosInstance.get("/products");
      setProducts(res.data);

    } catch (err) {
      console.error("Error fetching products:", err);

      // optional fallback (you can keep or remove)
      setProducts(featuredProducts);
    } finally {
      setIsLoading(false);
    }
  };

  fetchProducts();
}, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsLoading(true);
      const res = await AxiosInstance.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
      const data = res.data;
      if (!Array.isArray(data)) throw new Error("Invalid search response format");
      setProducts(data);
      if (data.length === 1) navigate(`/product/${data[0]._id}`);
    } catch (err) {
      console.error("Search error:", err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await AxiosInstance.post("/newsletter", { email });
      if (res.status === 201 || res.status === 200) {
        setMessage("✅ Thank you for joining!");
        setEmail("");
      } else {
        setError(res.data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  const handleProtectedAction = (action) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    action();
  };

  const displayedProducts = Array.isArray(products) ? products.slice(0, 6) : [];

  return (
    <div className="min-h-screen font-sans bg-white text-gray-800 overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Balanced and Clean */}
      <section
        className="relative text-center px-4 py-32 bg-cover bg-center rounded-b-[2rem] text-white shadow-lg overflow-hidden"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-md">
            Discover Handmade Treasures
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100 font-medium">
            Empowering artisans by showcasing handcrafted products from across India.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 max-w-2xl mx-auto">
            <Input
              placeholder="Search unique items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-white text-black border-none focus:ring-2 focus:ring-green-500"
            />
            <Button
              onClick={handleSearch}
              className="px-8 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-md font-bold transition-all active:scale-95"
            >
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Why Shop Section - Gray Container */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-gray-100 rounded-[3rem] shadow-inner border border-gray-200">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Why Shop with NicheNest?</h2>
          <div className="w-16 h-1.5 bg-green-600 mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {[
            { icon: "🎨", title: "100% Handmade", desc: "Crafted with love by skilled artisans across India." },
            { icon: "📦", title: "Fast Delivery", desc: "Doorstep delivery with tracking and premium packaging." },
            { icon: "🤝", title: "Community Support", desc: "Support real makers and preserve craftsmanship." },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white p-10 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section - Gray Container */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-gray-100 rounded-[3rem] shadow-inner border border-gray-200 mt-16">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            {searchQuery ? "🔍 Search Results" : "🌟 Featured Products"}
          </h2>
          {!searchQuery && (
            <Link to="/categories/art-decor" className="text-green-600 font-bold hover:underline text-sm">
              See All →
            </Link>
          )}
        </div>

        {searchQuery && products.length === 0 && (
          <div className="bg-red-50 text-red-500 p-6 rounded-2xl border border-red-100 text-center mb-10">
            ❌ No products found for "{searchQuery}"
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
  {isLoading ? (
    <div className="col-span-full py-20 flex justify-center items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      <span className="ml-3 text-gray-600 font-medium italic">
        Loading products...
      </span>
    </div>
  ) : (
    <>
      {displayedProducts && displayedProducts.length > 0 ? (
        displayedProducts.map((product) => (
          <div
            key={product._id || product.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1 group"
          >
            <div className="relative overflow-hidden rounded-xl h-56">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=Handcrafted+Item";
                }}
              />
              <span className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                Bestseller
              </span>
            </div>

            <h3 className="text-lg font-bold mt-4 text-gray-800 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Category: {product.category}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-green-600 font-black text-xl">
                ₹{product.price}
              </span>
              <div className="flex text-yellow-400 text-[10px] items-center gap-0.5">
                <FaStar /> <FaStar /> <FaStar /> <FaStar />
                <span className="ml-1 text-gray-400 font-bold">(4+)</span>
              </div>
            </div>

            <button
              className="mt-5 w-full rounded-xl bg-green-600 text-white py-2.5 font-bold hover:bg-green-700 transition-colors shadow-sm active:scale-95"
              onClick={() =>
                handleProtectedAction(() =>
                  navigate(`/product/${product._id || product.id}`)
                )
              }
            >
              View Details
            </button>
          </div>
        ))
      ) : (
        <div className="col-span-full py-20 text-center text-gray-400 italic bg-white rounded-2xl shadow-inner border border-gray-100">
          No products available
        </div>
      )}
    </>
  )}
        </div>
      </section>

      {/* Newsletter - Simplified but Modern */}
      <section className="bg-green-50 py-16 px-6 text-center rounded-[3rem] mx-4 my-20 border border-green-100 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Join Our Handmade Community</h2>
          <p className="mb-8 text-gray-600">
            Get updates on new arrivals, offers, and inspiring artisan stories.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row justify-center gap-3"
          >
            <Input
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:w-80 px-5 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-green-500"
            />
            <Button type="submit" className="px-10 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 font-bold shadow-md">
              Subscribe
            </Button>
          </form>
          {message && <p className="text-green-700 mt-4 font-medium">{message}</p>}
          {error && <p className="text-red-600 mt-4 font-medium">{error}</p>}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <TestimonialsSlider />
      </section>

      {/* Footer - Consistent with DesiEtsy style */}
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
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
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
