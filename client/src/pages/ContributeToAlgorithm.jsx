import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlgorithmBySlug } from "../features/algorithm/algorithmSlice"; // Adjust import
import Loader from "../components/Loader"; // Adjust import path if needed

const ContributeToAlgorithm = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const { algorithm, isLoading } = useSelector((state) => state.algorithm);
  const [contribution, setContribution] = useState("");

  useEffect(() => {
    dispatch(fetchAlgorithmBySlug(slug)); // Replace with your actual action
  }, [dispatch, slug]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with your submission logic
    console.log("Submitting contribution:", contribution);
  };

  if (isLoading || !algorithm) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-950">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Contribute to "{algorithm.name}"
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Share improvements, fixes, or additional code examples for this algorithm.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md space-y-6"
      >
        <div>
          <label
            htmlFor="contribution"
            className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2"
          >
            Your Contribution
          </label>
          <textarea
            id="contribution"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            placeholder="Write your thoughts, improvements, or code changes here..."
            className="w-full h-40 p-4 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 resize-y transition"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-xl shadow-md transition-all"
          >
            Submit Contribution
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContributeToAlgorithm;
