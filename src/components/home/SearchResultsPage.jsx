import React from "react";
import { useLocation } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  return (
    <div className="p-10">
      <h2 className="text-2xl font-semibold mb-4">
        Search results for: <span className="text-green-700">"{query}"</span>
      </h2>
      {/* You can display filtered items based on query here */}
      <p className="text-gray-500">🔍 Feature under development</p>
    </div>
  );
};

export default SearchResultsPage;
