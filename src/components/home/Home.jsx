// src/pages/HomePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../reusable/Button";
import { Input } from "../reusable/Input";
import Navbar from "../navbar/Navbar";
import { FaStar, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import TestimonialsSlider from "../home/TestimonialsSlider";
import heroBg from "../../assets/Images/banner.jpg";

// Fallback featured products
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
    name: "Wooden Jewelry Box",
    category: "Accessories",
    price: 999,
    description: "Elegant handcrafted wooden jewelry box.",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('user');

  // Fetch all products on initial load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/products/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!res.ok) throw new Error(`Search failed with status ${res.status}`);

      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("Invalid search response format");

      setProducts(data);

      if (data.length === 1) {
        navigate(`/product/${data[0]._id}`);
      }
    } catch (err) {
      console.error("Search error:", err.message);
      setProducts([]);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMessage(data.message);
        setEmail("");
      } else {
        setError(data.message || "Something went wrong.");
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

  // const displayedProducts = Array.isArray(products) && products.length > 0 ? products : featuredProducts;
  const displayedProducts = Array.isArray(products) ? products.slice(0, 6) : [];
  return (
    <div className="min-h-screen font-sans bg-white text-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative text-center px-4 py-40 bg-cover bg-center rounded-b-3xl text-white"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="relative z-10 max-w-3xl mx-auto bg-black/70 p-6 rounded-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Discover Handmade Treasures</h1>
          <p className="text-lg md:text-xl mb-6 text-gray-200">
            Empowering artisans by showcasing handcrafted products from across India.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Input
              placeholder="Search handmade items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 rounded-xl bg-white text-black"
            />
            <Button
              onClick={handleSearch}
              className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
            >
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">Why Shop with NicheNest?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          {[
            { icon: "🎨", title: "100% Handmade", desc: "Crafted with love by skilled artisans across India." },
            { icon: "📦", title: "Fast Delivery", desc: "Doorstep delivery with tracking and premium packaging." },
            { icon: "🤝", title: "Community Support", desc: "Support real makers and preserve craftsmanship." },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gray-100 p-6 rounded-xl border border-gray-300 hover:shadow-md transition-transform duration-300 hover:scale-105"
            >
              <h3 className="font-semibold text-lg mb-2">
                {feature.icon} {feature.title}
              </h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          🌟 {searchQuery ? "Search Results" : "Featured Products"}
        </h2>

        {searchQuery && Array.isArray(products) && products.length === 0 && (
          <p className="text-red-500 mb-6">❌ No products found for "{searchQuery}"</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {displayedProducts.map((product) => (
            <div
              key={product._id || product.id}
              className="bg-gray-100 rounded-2xl p-4 shadow relative border border-gray-300 transition-transform duration-300 hover:scale-105"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-52 w-full object-cover rounded-xl"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x200?text=Image+Unavailable";
                }}
              />
              <h3 className="text-lg font-semibold mt-3">{product.name}</h3>
              <p className="text-sm text-gray-600">Category: {product.category}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-green-600 font-bold">₹{product.price}</span>
                <div className="flex text-yellow-500 text-sm">
                  {[...Array(4)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                  <span className="ml-1 text-gray-500">(4+)</span>
                </div>
              </div>
              <button
                className="mt-4 w-full rounded-xl bg-green-600 text-white py-2 font-semibold hover:bg-green-700 transition-colors"
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate('/login');
                  } else {
                    navigate(`/product/${product._id || product.id}`);
                  }
                }}
              >
                View Details
              </button>
              <span className="absolute top-4 left-4 bg-pink-600 text-white text-xs px-3 py-1 rounded-full">
                Bestseller
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-green-100 py-12 px-6 text-center rounded-3xl mx-4 my-16">
        <h2 className="text-2xl font-semibold mb-2">Join Our Handmade Community</h2>
        <p className="mb-6 text-gray-600">
          Get updates on new arrivals, offers, and inspiring artisan stories.
        </p>
        <form
          onSubmit={handleNewsletterSubmit}
          className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto"
        >
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-white border border-gray-300"
          />
          <Button type="submit" className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">
            Subscribe
          </Button>
        </form>
        {message && <p className="text-green-700 mt-4">{message}</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4">
        <TestimonialsSlider />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-16 rounded-t-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-3">About Us</h4>
            <p className="text-sm leading-relaxed">
              We connect local artisans with customers seeking authentic handmade
              products. Empowering communities through craftsmanship.
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
            <p className="text-sm mt-4">📧 support@nichenest.com</p>
            <p className="text-sm">📞 +91 98765 43210</p>
          </div>
        </div>
        <p className="text-center mt-10 text-sm text-gray-400">
          © 2025 NicheNest. Celebrating handmade culture.
        </p>
      </footer>
    </div>
  );
}
