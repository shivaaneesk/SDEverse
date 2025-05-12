import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlgorithms,
  deleteExistingAlgorithm,
  updateExistingAlgorithm,
  createNewAlgorithm,
  fetchCategories,
} from "../features/algorithm/algorithmSlice";
import { MdEdit, MdDelete, MdSearch } from "react-icons/md";
import { toast } from "react-toastify";
import EditAlgorithmForm from "./EditAlgorithmForm";
import Loader from "../components/Loader";

const formatArray = (input) =>
  Array.isArray(input)
    ? input
    : input
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

const formatCodes = (input) =>
  Array.isArray(input)
    ? input
    : input.split("\n").map((code) => ({ language: "cpp", code }));

const AdminAlgorithms = () => {
  const dispatch = useDispatch();
  const { algorithms, loading, categories } = useSelector(
    (state) => state.algorithm
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingSlug, setEditingSlug] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    dispatch(fetchAlgorithms({}));
    dispatch(fetchCategories());
  }, [dispatch]);

  
  
  
  

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

  const handleEdit = (algo) => setEditingSlug(algo.slug);

  const handleSave = (data) => {
    const formatted = {
      ...data,
      category: formatArray(data.category),
      tags: formatArray(data.tags),
      links: formatArray(data.links),
      codes: formatCodes(data.codes),
    };

    const action = addingNew
      ? createNewAlgorithm(formatted)
      : updateExistingAlgorithm({
          slug: editingSlug,
          algorithmData: formatted,
        });

    dispatch(action)
      .unwrap()
      .then(() => {
        toast.success(addingNew ? "Algorithm created" : "Updated successfully");
        setEditingSlug(null);
        setAddingNew(false);
      })
      .catch(() =>
        toast.error(addingNew ? "Creation failed" : "Update failed")
      );
  };

  const handleCancel = () => {
    setEditingSlug(null);
    setAddingNew(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manage Algorithms
        </h1>

        <div className="flex flex-row flex-wrap md:flex-nowrap items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-[16rem]">
            <input
              type="text"
              placeholder="Search algorithms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white hover:text-blue-600 transition-colors"
            >
              <MdSearch size={20} />
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full md:w-[12rem]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white">
              ▼
            </div>
          </div>

          {/* Add New Button */}
          <button
            onClick={() => setAddingNew(true)}
            className="whitespace-nowrap px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            + New Algorithm
          </button>
        </div>
      </div>

      {/* Add New Form */}
      {addingNew && (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-lg p-6">
          <EditAlgorithmForm
            algorithm={{}}
            categories={categories} 
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Algorithm List */}
      {loading && algorithms.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader />
        </div>
      ) : (
        <div className="space-y-6">
          {algorithms.map((algo) => (
            <div
              key={algo.slug}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
            >
              {editingSlug === algo.slug ? (
                <EditAlgorithmForm
                  algorithm={algo}
                  categories={categories} 
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white break-words">
                      {algo.title}
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {algo.description}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>
                        <span className="font-medium">Category:</span>{" "}
                        {algo.category.join(", ")}
                      </p>
                      <p>
                        <span className="font-medium">Difficulty:</span>{" "}
                        {algo.difficulty}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex gap-4 items-start lg:items-center">
                    <button
                      onClick={() => handleEdit(algo)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm transition"
                    >
                      <MdEdit size={18} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(algo.slug)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm transition"
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
