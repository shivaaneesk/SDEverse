import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlgorithms,
  searchAllAlgorithms,
  deleteExistingAlgorithm,
  updateExistingAlgorithm,
  createNewAlgorithm,
  fetchCategories,
} from "../features/algorithm/algorithmSlice";
import { MdEdit, MdDelete, MdSearch } from "react-icons/md";
import { toast } from "react-toastify";
import EditAlgorithmForm from "../components/forms/EditAlgorithmForm";
import Loader from "../components/Loader";
import Pagination from "./Pagination";

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

  const {
    algorithms = [],
    loading,
    categories = [],
    totalPages,
  } = useSelector((state) => state.algorithm);

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [editingSlug, setEditingSlug] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    if (isSearchMode) {
      dispatch(
        searchAllAlgorithms({
          q: search,
          category: selectedCategories.length
            ? selectedCategories.join(",")
            : undefined,
          page: currentPage,
        })
      );
    } else {
      dispatch(fetchAlgorithms({ page: currentPage }));
    }
    dispatch(fetchCategories());
  }, [dispatch, currentPage, isSearchMode, search, selectedCategories]);

  const handleSearch = () => {
    setIsSearchMode(true);
    setCurrentPage(1);
    dispatch(
      searchAllAlgorithms({
        search,
        categories: selectedCategories.length ? selectedCategories : undefined,
        page: 1,
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
        if (isSearchMode) {
          dispatch(
            searchAllAlgorithms({
              search,
              categories: selectedCategories.length
                ? selectedCategories
                : undefined,
              page: currentPage,
            })
          );
        } else {
          dispatch(fetchAlgorithms({ page: currentPage }));
        }
      })
      .catch(() =>
        toast.error(addingNew ? "Creation failed" : "Update failed")
      );
  };

  const handleCancel = () => {
    setEditingSlug(null);
    setAddingNew(false);
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header and New Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manage Algorithms
        </h1>
        <button
          onClick={() => setAddingNew(true)}
          className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + New Algorithm
        </button>
      </div>

      {/* New Form */}
      {addingNew && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <EditAlgorithmForm
            algorithm={{}}
            categories={categories}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Search + Category Filters */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by algorithm title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white hover:text-blue-600"
          >
            <MdSearch size={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm border transition-all ${
                selectedCategories.includes(cat)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Algorithm Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-300">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Difficulty</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && algorithms.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6">
                  <Loader />
                </td>
              </tr>
            ) : (
              algorithms.map((algo) => (
                <Fragment key={algo.slug}>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {algo.title}
                    </td>
                    <td className="px-6 py-4">
                      {Array.isArray(algo.category)
                        ? algo.category.join(", ")
                        : algo.category}
                    </td>
                    <td className="px-6 py-4">{algo.difficulty}</td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => handleEdit(algo)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(algo.slug)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                  {editingSlug === algo.slug && (
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td colSpan="4" className="px-6 py-4">
                        <EditAlgorithmForm
                          algorithm={algo}
                          categories={categories}
                          onSave={handleSave}
                          onCancel={handleCancel}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || 1}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default AdminAlgorithms;
