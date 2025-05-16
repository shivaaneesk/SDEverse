import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProposals } from "../features/proposal/proposalSlice";
import { useNavigate } from "react-router-dom";
import { FileText, PenLine, Search } from "lucide-react";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const MyProposals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { proposals, loading, error, total, pages, currentPage } = useSelector(
    (state) => state.proposal
  );

  // Local state for filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchText, 500);

  // Build query string for API
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", 10);
    if (statusFilter) params.append("status", statusFilter);
    if (debouncedSearch) params.append("search", debouncedSearch);
    return params.toString();
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    const query = buildQuery();
    dispatch(fetchProposals(query));
  }, [dispatch, buildQuery]);

  const handleEdit = (slug) => {
    navigate(`/proposals/${slug}/edit`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "pending":
      default:
        return "text-yellow-700 bg-yellow-100";
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // reset page on filter change
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setPage(1); // reset page on search change
  };

  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };
  const nextPage = () => {
    if (page < pages) setPage((p) => p + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800 dark:text-white flex justify-center items-center gap-2">
        <FileText size={32} />
        My Proposals
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64 bg-white dark:bg-gray-800">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search by title or tags..."
            className="w-full bg-transparent focus:outline-none text-gray-900 dark:text-gray-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading && (
        <p className="text-center text-gray-500 text-lg">Loading proposals...</p>
      )}

      {error && (
        <p className="text-center text-red-500 font-semibold">Error: {error}</p>
      )}

      {!loading && proposals.length === 0 && (
        <p className="text-center text-gray-400 text-lg">
          No proposals found with current filters.
        </p>
      )}

      {!loading && proposals.length > 0 && (
        <>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
            <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Difficulty</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Created</th>
                  <th className="px-4 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr
                    key={proposal._id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-6 py-4 font-medium max-w-xs truncate">
                      {proposal.title}
                    </td>
                    <td className="px-4 py-4">{proposal.category}</td>
                    <td className="px-4 py-4">{proposal.difficulty}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                          proposal.status
                        )}`}
                      >
                        {proposal.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleEdit(proposal.slug)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:underline"
                      >
                        <PenLine size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 text-gray-700 dark:text-gray-300">
            <button
              onClick={prevPage}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                page === 1
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Previous
            </button>

            <p className="text-sm">
              Page <span className="font-semibold">{page}</span> of{" "}
              <span className="font-semibold">{pages}</span> — Total{" "}
              <span className="font-semibold">{total}</span> proposals
            </p>

            <button
              onClick={nextPage}
              disabled={page === pages}
              className={`px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                page === pages
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyProposals;
