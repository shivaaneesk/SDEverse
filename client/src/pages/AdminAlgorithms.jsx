import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlgorithms,
  deleteExistingAlgorithm,
  updateExistingAlgorithm,
} from "../features/algorithm/algorithmSlice";
import { MdEdit, MdDelete, MdSearch } from "react-icons/md";
import { toast } from "react-toastify";
import EditAlgorithmForm from "./EditAlgorithmForm";
import Loader from "../components/Loader";

const AdminAlgorithms = () => {
  const dispatch = useDispatch();
  const { algorithms, loading } = useSelector((state) => state.algorithm);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingSlug, setEditingSlug] = useState(null);

  useEffect(() => {
    dispatch(fetchAlgorithms({}));
  }, [dispatch]);

  const categories = [
    "All",
    ...new Set(algorithms.flatMap((algo) => algo.category)),
  ];

  const handleSearch = () => {
    dispatch(
      fetchAlgorithms({
        search,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
      })
    );
  };

  const handleDelete = (slug) => {
    dispatch(deleteExistingAlgorithm(slug))
      .unwrap()
      .then(() => toast.success("Deleted successfully"))
      .catch(() => toast.error("Delete failed"));
  };

  const handleEdit = (algo) => {
    setEditingSlug(algo.slug);
  };

  const handleSave = (editedData) => {
    dispatch(
      updateExistingAlgorithm({
        slug: editingSlug,
        algorithmData: {
          ...editedData,
          category: Array.isArray(editedData.category)
            ? editedData.category
            : editedData.category
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean),
          tags: Array.isArray(editedData.tags)
            ? editedData.tags
            : editedData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
          links: Array.isArray(editedData.links)
            ? editedData.links
            : editedData.links
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean),
          codes: Array.isArray(editedData.codes)
            ? editedData.codes
            : editedData.codes
                .split("\n")
                .map((code) => ({ language: "cpp", code })),
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Updated successfully");
        setEditingSlug(null);
      })
      .catch(() => toast.error("Update failed"));
  };

  const handleCancel = () => {
    setEditingSlug(null);
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Manage Algorithms
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search algorithms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white"
            >
              <MdSearch size={20} />
            </button>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading or Algorithm List */}
      {loading && algorithms.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader />
        </div>
      ) : (
        <div className="space-y-6">
          {algorithms.map((algo) => (
            <div
              key={algo.slug}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6"
            >
              {editingSlug === algo.slug ? (
                <EditAlgorithmForm
                  algorithm={algo}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white break-words">
                      {algo.title}
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {algo.description}
                    </p>
                    <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Category:</strong> {algo.category.join(", ")}
                      </p>
                      <p>
                        <strong>Difficulty:</strong> {algo.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-4 items-start lg:items-center mt-2 lg:mt-0">
                    <button
                      onClick={() => handleEdit(algo)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <MdEdit size={18} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(algo.slug)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <MdDelete size={18} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAlgorithms;
