import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../navbar/Navbar";
import { Input } from "../../../reusable/Input";
import { Button } from "../../../reusable/Button";
import bannerImg from "../../../../assets/Images/banner.jpg";

const API = "http://localhost:5000/api";

const ArtDecor = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Art & Decor products on component mount
  useEffect(() => {
    const fetchArtDecorProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        // Filter products for Art & Decor category
        const artDecorProducts = data.filter(product => 
          product.category && product.category.toLowerCase().includes('art') || 
          product.category && product.category.toLowerCase().includes('decor') ||
          product.category && product.category.toLowerCase().includes('home decor')
        );
        setProducts(artDecorProducts);
      } catch (err) {
        console.error("Error fetching Art & Decor products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtDecorProducts();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(
        `${API}/products/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!res.ok) throw new Error(`Search failed with status ${res.status}`);

      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("Invalid search response format");

      // Filter search results for Art & Decor category
      const artDecorResults = data.filter(product => 
        product.category && product.category.toLowerCase().includes('art') || 
        product.category && product.category.toLowerCase().includes('decor') ||
        product.category && product.category.toLowerCase().includes('home decor')
      );

      setProducts(artDecorResults);

      if (artDecorResults.length === 1) {
        navigate(`/product/${artDecorResults[0]._id}`);
      }
    } catch (err) {
      console.error("Search error:", err.message);
      setProducts([]);
    }
  };

  const displayedProducts = Array.isArray(products) ? products : [];

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
            style={{ backgroundColor: "rgba(0, 0, 0, 0.61)" }}
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
              Art & Decor
            </h1>
            <p className="text-lg sm:text-xl">
              Discover beautifully crafted home décor and artistic creations by talented artisans.
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-4xl mx-auto px-4 py-10 text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Input
            placeholder="Search art & decor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          🎨 {searchQuery ? "Search Results" : "Featured Art & Decor"}
        </h3>

        {searchQuery && displayedProducts.length === 0 && (
          <p className="text-red-500 mb-6">❌ No art & decor products found for "{searchQuery}"</p>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading art & decor products...</p>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {displayedProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No art & decor products found.</p>
            ) : (
              displayedProducts.map((product) => (
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
                  <p className="text-sm text-gray-500 mb-3">Category: {product.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-green-600 font-bold">₹{product.price}</span>
                    <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                  </div>
                  <Link to={`/categories/art-decor/${product._id}`}>
                <Button className="w-full rounded-xl bg-green-600 text-white hover:bg-green-700">
                  View Details
                </Button>
              </Link>
            </div>
              ))
            )}
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
              <li><Link to="/categories" className="hover:underline">Categories</Link></li>
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

export default ArtDecor;
