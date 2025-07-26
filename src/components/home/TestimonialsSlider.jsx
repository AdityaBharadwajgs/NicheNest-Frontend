import React from "react";

const testimonials = [
  {
    id: 1,
    name: "Riya Sharma",
    text: "Amazing craftsmanship! Loved the unique designs and quality.",
  },
  {
    id: 2,
    name: "Karan Mehta",
    text: "Great customer service and fast delivery. Highly recommended!",
  },
  {
    id: 3,
    name: "Anjali Patel",
    text: "I found perfect gifts here, very authentic and handmade.",
  },
];

export default function TestimonialsSlider() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 bg-white rounded-3xl shadow-md">
      <h2 className="text-2xl font-bold mb-8 text-center">What Our Customers Say</h2>
      <div className="space-y-8 max-w-3xl mx-auto">
        {testimonials.map(({ id, name, text }) => (
          <div
            key={id}
            className="bg-green-50 p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <p className="italic mb-4">"{text}"</p>
            <p className="font-semibold text-green-700">- {name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
