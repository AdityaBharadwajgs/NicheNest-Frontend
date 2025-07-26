import React from "react";
import { useParams, Link } from "react-router-dom";
import { FaBoxOpen, FaCheckCircle } from "react-icons/fa";
import { Button } from "../reusable/Button";

export default function TrackOrder() {
  const { trackingId } = useParams();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <FaBoxOpen className="text-blue-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Order Tracking</h2>
        <p className="text-gray-600 mb-4">Tracking ID: <span className="font-mono text-blue-700">{trackingId}</span></p>
        <div className="mb-6">
          <p className="text-lg text-blue-700 font-semibold mb-2">Your order is getting ready!</p>
          <p className="text-gray-500">We are preparing your order for shipment. You will receive updates as soon as it is shipped.</p>
        </div>
        <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
        <p className="text-green-700 font-medium mb-6">Thank you for shopping with us!</p>
        <Link to="/home">
          <Button className="bg-blue-600 text-white w-full">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
} 