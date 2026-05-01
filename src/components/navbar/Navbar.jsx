import {
  Menu,
  X,
  Home,
  ShoppingCart,
  User,
  LogIn,
  ChevronDown,
  Flower,
  Gem,
  Shirt,
  Store,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../reusable/Button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    if (storedRole) setUserRole(storedRole);
    if (token || user) setIsLoggedIn(true);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  // Guard for protected routes
  const handleProtectedNavigation = (path) => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      handleNavigation(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-[var(--black)] shadow-md rounded-2xl px-4 py-4 sm:px-10 flex justify-between items-center relative z-50">
      <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 cursor-pointer transition-transform hover:scale-105" onClick={() => handleNavigation("/home")}>
        <Store className="text-white" /> NicheNest
      </h1>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-2 text-white">
        <Button onClick={() => handleNavigation("/home")} className="hover:bg-white/10 rounded-lg p-2 transition-colors">
          <Home className="w-5 h-5" />
        </Button>

        <div className="relative">
          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
          >
            Categories <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </Button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 bg-white shadow-xl rounded-xl p-2 w-48 space-y-1 border border-gray-100 origin-top animate-in fade-in slide-in-from-top-2 duration-200">
              <Button className="w-full justify-start gap-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors" onClick={() => handleNavigation("/categories/art-decor")}>
                <Flower className="w-4 h-4" /> Art & Decor
              </Button>
              <Button className="w-full justify-start gap-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors" onClick={() => handleNavigation("/categories/jewelry")}>
                <Gem className="w-4 h-4" /> Jewellery
              </Button>
              <Button className="w-full justify-start gap-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors" onClick={() => handleNavigation("/categories/clothing")}>
                <Shirt className="w-4 h-4" /> Clothing
              </Button>
            </div>
          )}
        </div>

        {/* Cart — hidden for admin */}
        {userRole !== 'admin' && (
          <Button onClick={() => handleNavigation("/cart")} className="flex items-center gap-1 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors">
            <ShoppingCart className="w-4 h-4" /> Cart
          </Button>
        )}

        {isLoggedIn ? (
          <Button onClick={handleLogout} className="flex items-center gap-1 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors">
            <LogIn className="w-4 h-4" /> Logout
          </Button>
        ) : (
          <Button onClick={() => handleNavigation("/login")} className="flex items-center gap-1 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors">
            <LogIn className="w-4 h-4" /> Login / Signup
          </Button>
        )}

        {isLoggedIn && userRole !== "admin" && (
          <Button onClick={() => handleProtectedNavigation("/profile")} className="flex items-center gap-1 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors">
            <User className="w-4 h-4" /> Profile
          </Button>
        )}

        {isLoggedIn && userRole === "admin" && (
          <Button onClick={() => handleNavigation("/admin/dashboard")} className="flex items-center gap-1 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors">
            <User className="w-4 h-4" /> Admin
          </Button>
        )}
      </nav>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-4 mt-3 w-64 bg-white shadow-2xl rounded-xl p-4 flex flex-col gap-2 lg:hidden border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-200">
          <Button onClick={() => handleNavigation("/home")} className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 w-full justify-start">
            <Home className="w-4 h-4" /> Home
          </Button>

          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 justify-between text-gray-800 hover:bg-gray-100 w-full"
          >
            <span className="flex items-center gap-2">Categories</span> 
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </Button>

          {isDropdownOpen && (
            <div className="pl-4 space-y-1 border-l-2 border-gray-200 ml-2 animate-in fade-in duration-200">
              <Button className="w-full justify-start gap-2 text-gray-600 hover:text-green-600 hover:bg-gray-50" onClick={() => handleNavigation("/categories/art-decor")}>
                <Flower className="w-4 h-4" /> Art & Decor
              </Button>
              <Button className="w-full justify-start gap-2 text-gray-600 hover:text-green-600 hover:bg-gray-50" onClick={() => handleNavigation("/categories/jewelry")}>
                <Gem className="w-4 h-4" /> Jewellery
              </Button>
              <Button className="w-full justify-start gap-2 text-gray-600 hover:text-green-600 hover:bg-gray-50" onClick={() => handleNavigation("/categories/clothing")}>
                <Shirt className="w-4 h-4" /> Clothing
              </Button>
            </div>
          )}

          {/* Cart — hidden for admin */}
          {userRole !== 'admin' && (
            <Button onClick={() => handleNavigation("/cart")} className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 w-full justify-start">
              <ShoppingCart className="w-4 h-4" /> Cart
            </Button>
          )}

          {isLoggedIn ? (
            <Button onClick={handleLogout} className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 w-full justify-start">
              <LogIn className="w-4 h-4" /> Logout
            </Button>
          ) : (
            <Button onClick={() => handleNavigation("/login")} className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 w-full justify-start">
              <LogIn className="w-4 h-4" /> Login / Signup
            </Button>
          )}

          {isLoggedIn && userRole !== "admin" && (
            <Button onClick={() => handleProtectedNavigation("/profile")} className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 w-full justify-start">
              <User className="w-4 h-4" /> Profile
            </Button>
          )}

          {isLoggedIn && userRole === "admin" && (
            <Button onClick={() => handleNavigation("/admin/dashboard")} className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 w-full justify-start">
              <User className="w-4 h-4" /> Admin
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
