import React from "react";

export const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-[oklch(62.7%_0.194_149.214)] text-white text-md py-2 px-4 rounded hover:bg-[oklch(52.7%_0.194_149.214)] transition duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
