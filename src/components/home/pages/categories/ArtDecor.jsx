import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../navbar/Navbar";
import { Input } from "../../../reusable/Input";
import { Button } from "../../../reusable/Button";
import bannerImg from "../../../../assets/Images/banner.jpg";

const API = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

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

      {/* Hero Banner - Matched to Home Design */}
      <section
        className="relative text-center px-4 py-32 bg-cover bg-center rounded-b-[2rem] text-white shadow-lg overflow-hidden"
        style={{ backgroundImage: `url(${bannerImg})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-md">
            Art & Decor
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100 font-medium">
            Discover beautifully crafted home décor and artistic creations by talented artisans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 max-w-2xl mx-auto">
            <Input
              placeholder="Search art & decor..."
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



      {/* Product Grid - Wrapped in Gray Container */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-gray-100 rounded-[3rem] shadow-inner border border-gray-200 mt-10">
        <h3 className="text-3xl font-bold mb-10 text-gray-800">
          🎨 {searchQuery ? "Search Results" : "Featured Art & Decor"}
        </h3>

        {searchQuery && displayedProducts.length === 0 && (
          <p className="bg-white/50 text-red-500 p-4 rounded-xl border border-red-100 mb-10 text-center font-medium">❌ No art & decor products found for "{searchQuery}"</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {displayedProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 italic py-10 bg-white/30 rounded-2xl border border-white/50">No art & decor products found.</p>
            ) : (
              displayedProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1 group"
                >
                  <div className="relative overflow-hidden rounded-xl h-48 mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=Image+Unavailable";
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-gray-800 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 font-medium">Category: {product.category}</p>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-green-600 font-black text-xl">₹{product.price}</span>
                    <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded-full border border-gray-100 font-bold uppercase">Stock: {product.stock}</span>
                  </div>
                  <Link to={`/categories/art-decor/${product._id}`}>
                    <Button className="w-full rounded-xl bg-green-600 text-white py-2.5 font-bold hover:bg-green-700 transition-colors shadow-sm active:scale-95">
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
