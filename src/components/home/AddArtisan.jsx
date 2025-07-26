import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../navbar/Navbar";

export default function AddArtisan() {
  const [artisan, setArtisan] = useState({
    name: "",
    email: "",
    bio: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setArtisan({ ...artisan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/artisans", artisan);
      if (res.status === 201 || res.status === 200) {
        alert("✅ Artisan added successfully!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("❌ Error adding artisan:", error.message);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800">
      <Navbar />

      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center text-green-700">Add Artisan</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md space-y-6 border border-gray-200"
        >
          <div>
            <label className="block mb-1 font-semibold">Artisan Name</label>
            <input
              type="text"
              name="name"
              value={artisan.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Meena Kumari"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Email Address</label>
            <input
              type="email"
              name="email"
              value={artisan.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. meena@desietsy.com"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Bio / Description</label>
            <textarea
              name="bio"
              value={artisan.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tell us something about the artisan..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 shadow"
          >
            ➕ Add Artisan
          </button>
        </form>
      </section>
    </div>
  );
}
