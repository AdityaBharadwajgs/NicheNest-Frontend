import React from "react";
import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    name: "Riya Sharma",
    text: "The handcrafted terracotta vase I ordered is stunning. The attention to detail is remarkable!",
    rating: 5
  },
  {
    id: 2,
    name: "Karan Mehta",
    text: "Great customer service and the packaging was very secure. My brass lamp arrived in perfect condition.",
    rating: 5
  },
  {
    id: 3,
    name: "Anjali Patel",
    text: "I love supporting local artisans. NicheNest makes it so easy to find authentic handmade products.",
    rating: 4
  },
  {
    id: 4,
    name: "Vikram Singh",
    text: "The woolen shawl is so cozy and the weave is beautiful. Highly recommend for genuine craft!",
    rating: 5
  },
  {
    id: 5,
    name: "Sneha Kapoor",
    text: "Found the perfect jewelry box for my sister. It's unique and elegant. Will definitely shop again.",
    rating: 5
  },
  {
    id: 6,
    name: "Amit Verma",
    text: "Fast delivery and excellent quality. The block print fabric is exactly what I was looking for.",
    rating: 4
  }
];

export default function TestimonialsSlider() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 bg-gray-100 rounded-[3rem] mt-16 border border-gray-200 shadow-inner">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">What Our Customers Say</h2>
        <p className="text-gray-600 text-sm italic font-medium">Real stories from our handmade community</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map(({ id, name, text, rating }) => (
          <div
            key={id}
            className="bg-white p-8 rounded-2xl shadow-md border border-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex text-yellow-400 text-sm mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < rating ? "fill-current" : "text-gray-200"} />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "{text}"
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <p className="font-bold text-green-700 text-sm">- {name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
