import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../navbar/Navbar";
import { Input } from "../../../reusable/Input";
import { Button } from "../../../reusable/Button";
import bannerImg from "../../../../assets/Images/banner.jpg";
import AxiosInstance from "../../../../config/Api_call";

const Jewelry = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await AxiosInstance.get('/products');
      const jewelryProducts = response.data.filter(product => 
        product.category && product.category.toLowerCase() === 'jewelry'
      );
      setProducts(jewelryProducts);
      setFilteredProducts(jewelryProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans bg-white text-gray-800">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-xl">Loading jewelry products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-white text-gray-800">
      {/* Navbar */}
      <Navbar />

      {/* Hero Banner */}
      <section
        className="relative h-[60vh] bg-cover bg-center rounded-b-3xl shadow"
        style={{ backgroundImage: `url(${bannerImg})` }}
      >
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className="px-6 py-5 rounded-xl text-white text-center max-w-2xl mx-4 sm:mx-auto"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">Jewelry</h1>
            <p className="text-lg sm:text-xl">
              Discover handcrafted jewelry infused with heritage and love.
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-4xl mx-auto px-4 py-10 text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Input
            placeholder="Search jewelry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full sm:w-80 border border-gray-300 rounded-xl px-4 py-2 shadow"
          />
          <Button 
            onClick={handleSearch}
            className="rounded-xl px-6 w-full sm:w-auto bg-green-600 text-white hover:bg-green-700 transition"
          >
            Search
          </Button>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">
          💎 {searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Jewelry'}
        </h3>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-4">
              {searchTerm ? `No jewelry found for "${searchTerm}"` : 'No jewelry products available'}
            </p>
            {searchTerm && (
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setFilteredProducts(products);
                }}
                className="bg-green-600 text-white"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition transform hover:scale-[1.02]"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-48 w-full object-cover rounded-xl mb-4"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=Image+Unavailable";
                  }}
                />
                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-green-600 font-bold">₹{product.price}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>

                {/* ✅ Correct Route to JewelryDetailsPage */}
                <Link to={`/categories/jewelry/${product._id}`}>
                  <Button className="w-full rounded-xl bg-green-600 text-white hover:bg-green-700">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

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
            <h4 className="font-bold text-lg mb-3">Contact</h4>
            <p className="text-sm">📧 support@desietsy.com</p>
            <p className="text-sm">📞 +91 98765 43210</p>
            <p className="text-sm">📍 New Delhi, India</p>
          </div>
        </div>
        <p className="text-center mt-10 text-sm text-gray-400">
          © 2025 DesiEtsy. Celebrating handmade culture.
        </p>
      </footer>
    </div>
  );
};

export default Jewelry;
