import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../config/Api_call";
import { errorToast, successToast } from "../../plugins/toast";
import Navbar from "../navbar/Navbar";
import { Button } from "../reusable/Button";
import { Input } from "../reusable/Input";

const EditArtisan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [artisanData, setArtisanData] = useState({
    name: "",
    email: "",
    number: "",
    address: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch artisan details
  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        const res = await AxiosInstance.get(`/artisans/${id}`);
        setArtisanData({
          name: res.data.name || "",
          email: res.data.email || "",
          number: res.data.number || "",
          address: res.data.address || "",
          bio: res.data.bio || "",
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load artisan details");
        setLoading(false);
      }
    };

    fetchArtisan();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setArtisanData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AxiosInstance.put(`/artisans/${id}`, artisanData);
      successToast("✅ Artisan updated successfully!");
      navigate("/admin/dashboard"); // Redirect to dashboard after update
    } catch (err) {
      errorToast("❌ Failed to update artisan.");
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-8 bg-white mt-10 shadow rounded-xl">
        <h2 className="text-2xl font-bold mb-6">✏️ Edit Artisan</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={artisanData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Meena Kumari"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={artisanData.email}
            onChange={handleChange}
            required
            placeholder="e.g. meena@desietsy.com"
          />
          <Input
            label="Phone"
            name="number"
            value={artisanData.number}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
          />
          <Input
            label="Address"
            name="address"
            value={artisanData.address}
            onChange={handleChange}
            placeholder="e.g. Jaipur, India"
          />
          <label className="block text-gray-700 font-medium">Bio</label>
          <textarea
            name="bio"
            value={artisanData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 p-2 rounded-md"
            placeholder="Tell us something about the artisan..."
          ></textarea>

          <Button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg">
            Update Artisan
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditArtisan;