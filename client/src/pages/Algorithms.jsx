import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchAlgorithms,
  searchAllAlgorithms,
} from "../features/algorithm/algorithmSlice";
import { Link } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Algorithm = () => {
  const dispatch = useDispatch();
  const { categories, algorithms, loading, error, total } = useSelector(
    (state) => state.algorithm
  );
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Fetch categories and algorithms on initial render
    dispatch(fetchCategories());
    dispatch(fetchAlgorithms({ page: 1, limit: 10 })); // Fetching initial set of algorithms
  }, [dispatch]);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      dispatch(searchAllAlgorithms({ search: e.target.value }));
    } else {
      dispatch(fetchAlgorithms({ page: 1, limit: 10 }));
    }
  };

  // Toggle category visibility
  const toggleCategory = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Forward"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        What is an Algorithm?
      </h1>
      <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
        Algorithms are step-by-step procedures or formulas for solving a
        problem. They form the backbone of computer programming and data
        science, enabling us to solve complex problems efficiently.
      </p>

      {/* Search Bar */}
      <div className="mt-6 flex items-center space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search Algorithms..."
            className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="mt-8">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className="mb-6">
              <div
                className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900 dark:text-white"
                onClick={() => toggleCategory(category)}
              >
                <span className="text-white">{category}</span>{" "}
                {/* ← using white text explicitly */}
                <ChevronDown
                  size={24}
                  className={`transition-transform ${
                    selectedCategory === category ? "rotate-180" : ""
                  }`}
                />
              </div>

              {selectedCategory === category && (
                <div className="mt-4 space-y-4">
                  {algorithms
                    .filter((algo) => algo.category?.includes(category)) // category is an array in DB
                    .map((algorithm) => (
                      <Link
                        to={`/algorithms/${algorithm.slug}`}
                        key={algorithm.slug}
                        className="block p-4 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
                      >
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                          {algorithm.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {algorithm.description || algorithm.intuition}
                        </p>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-300">
            No categories available.
          </p>
        )}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center mt-6">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {/* No Algorithms Found Message */}
      {total === 0 && !loading && !error && (
        <p className="mt-6 text-gray-500 dark:text-gray-300">
          No algorithms found. Try a different search.
        </p>
      )}
    </div>
  );
};

export default Algorithm;
