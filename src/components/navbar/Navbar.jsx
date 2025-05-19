import React, { useState } from 'react'
import { Sparkles, ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { Button } from '../reusable/Button';

const Navbar = () => {
     const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
  <>
    <header className="flex justify-between items-center py-6 px-4 sm:px-10 shadow-md bg-white rounded-2xl mb-10 relative">
        <h1 className="text-3xl sm:text-4xl font-bold text-green-700 flex items-center gap-2">
          <Sparkles className="text-green-600" /> NicheNest
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-4 text-gray-700">
          <Button variant="ghost">Home</Button>
          <Button variant="ghost">Categories</Button>
          <Button variant="ghost">Top Sellers</Button>
          <Button variant="ghost">New Arrivals</Button>
          <Button variant="ghost">Offers</Button>
          <Button variant="ghost">Support</Button>
          <Button variant="ghost" className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> Wishlist
          </Button>
          <Button variant="ghost" className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" /> Cart
          </Button>
          <Button variant="ghost" className="flex items-center gap-1">
            <User className="w-4 h-4" /> Profile
          </Button>
        </nav>

        {/* Hamburger Button (Mobile) */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full right-4 mt-2 w-56 bg-white shadow-lg rounded-xl p-4 flex flex-col gap-2 z-50 lg:hidden">
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">Categories</Button>
            <Button variant="ghost">Top Sellers</Button>
            <Button variant="ghost">New Arrivals</Button>
            <Button variant="ghost">Offers</Button>
            <Button variant="ghost">Support</Button>
            <Button variant="ghost" className="flex items-center gap-1">
              <Heart className="w-4 h-4" /> Wishlist
            </Button>
            <Button variant="ghost" className="flex items-center gap-1">
              <ShoppingCart className="w-4 h-4" /> Cart
            </Button>
            <Button variant="ghost" className="flex items-center gap-1">
              <User className="w-4 h-4" /> Profile
            </Button>
          </div>
        )}
      </header>
  </>
  )
}

export default Navbar