import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../config/Api_call";
import { errorToast, successToast } from "../../plugins/toast";
import Navbar from "../navbar/Navbar";

export default function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category ||
      !formData.description ||
      !formData.image
    ) {
      errorToast("⚠️ Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await AxiosInstance.post("/products", formData);
      successToast("✅ Product added successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("❌ Error adding product:", error.response?.data || error.message);
      errorToast("❌ Failed to add product. Please check the data and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center text-green-700">
          🛍️ Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
              className="w-full mt-1 p-2 border rounded"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
