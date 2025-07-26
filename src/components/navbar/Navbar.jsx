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
  const [userRole, setUserRole] = useState(null); // new state to store role
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role"); // e.g. "admin", "user"
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  return (
    <header className="bg-[var(--black)] shadow-md rounded-2xl px-1 py-4 sm:px-10 flex justify-between items-center relative">
      <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
        <Store className="text-white" /> NicheNest
      </h1>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-4 text-white">
        <Button onClick={() => navigate("/home")}>
          <Home className="w-5 h-5" />
        </Button>

        <div className="relative">
          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1"
          >
            Categories <ChevronDown className="w-4 h-4" />
          </Button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 bg-white shadow-lg rounded-xl p-2 z-50 w-48 space-y-1">
              <Button className="w-full justify-start gap-2" onClick={() => navigate("/categories/art-decor")}>
                <Flower className="w-4 h-4" /> Art & Decor
              </Button>
              <Button className="w-full justify-start gap-2" onClick={() => navigate("/categories/jewelry")}>
                <Gem className="w-4 h-4" /> Jewelry
              </Button>
              <Button className="w-full justify-start gap-2" onClick={() => navigate("/categories/clothing")}>
                <Shirt className="w-4 h-4" /> Clothing
              </Button>
            </div>
          )}
        </div>

        <Button onClick={() => navigate("/cart")} className="flex items-center gap-1">
          <ShoppingCart className="w-4 h-4" /> Cart
        </Button>

        <Button onClick={() => navigate("/register_user")} className="flex items-center gap-1">
          <LogIn className="w-4 h-4" /> Signup/Login
        </Button>

        {/* 👤 Show "User" button only if not admin */}
        {userRole !== "admin" && (
          <Button onClick={() => navigate("/profile")} className="flex items-center gap-1">
            <User className="w-4 h-4" /> User
          </Button>
        )}

        {/* 🛠️ Show "Admin" button only if admin */}
        {userRole === "admin" && (
          <Button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-1">
            <User className="w-4 h-4" /> Admin
          </Button>
        )}
      </nav>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-2 rounded-md text-white hover:bg-white/10"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-4 mt-3 w-60 bg-white shadow-lg rounded-xl p-4 flex flex-col gap-2 z-50 lg:hidden">
          <Button onClick={() => navigate("/home")} className="flex items-center gap-2">
            <Home className="w-4 h-4" /> Home
          </Button>

          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 justify-between"
          >
            Categories <ChevronDown className="w-4 h-4" />
          </Button>

          {isDropdownOpen && (
            <div className="pl-4 space-y-1">
              <Button className="w-full justify-start gap-2" onClick={() => navigate("/categories/art-decor")}>
                <Flower className="w-4 h-4" /> Art & Decor
              </Button>
              <Button className="w-full justify-start gap-2" onClick={() => navigate("/categories/jewelry")}>
                <Gem className="w-4 h-4" /> Jewelry
              </Button>
              <Button className="w-full justify-start gap-2" onClick={() => navigate("/categories/clothing")}>
                <Shirt className="w-4 h-4" /> Clothing
              </Button>
            </div>
          )}

          <Button onClick={() => navigate("/cart")} className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Cart
          </Button>

          <Button onClick={() => navigate("/register_user")} className="flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Signup/Login
          </Button>

          {/* 👤 Show "User" button only if not admin */}
          {userRole !== "admin" && (
            <Button onClick={() => navigate("/profile")} className="flex items-center gap-2">
              <User className="w-4 h-4" /> User
            </Button>
          )}

          {/* 🛠️ Show "Admin" button only if admin */}
          {userRole === "admin" && (
            <Button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-2">
              <User className="w-4 h-4" /> Admin
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
