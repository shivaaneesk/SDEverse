import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProposals } from "../features/proposal/proposalSlice";
import { useNavigate } from "react-router-dom";
import { FileText, PenLine, Search } from "lucide-react";
import Pagination from "./Pagination";

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

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    const query = {
      page,
      limit: 10,
      ...(statusFilter && { status: statusFilter }),
      ...(debouncedSearch && { search: debouncedSearch }),
    };

    dispatch(fetchProposals(query));
  }, [dispatch, page, statusFilter, debouncedSearch]);

  const handleEdit = (slug) => {
    navigate(`/proposals/${slug}/edit`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "text-green-800 bg-green-100/80";
      case "rejected":
        return "text-rose-700 bg-rose-100/80";
      case "pending":
      default:
        return "text-amber-700 bg-amber-100/80";
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FileText className="text-indigo-600" size={28} />
          My Proposals
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search proposals..."
              className="pl-10 w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="rounded-lg border border-gray-300 bg-white dark:bg-gray-800 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-900/30 p-4 mb-6">
          <p className="text-center text-rose-700 dark:text-rose-300 font-medium">
            Error: {error}
          </p>
        </div>
      )}

      {!loading && !error && proposals.length === 0 && (
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mx-auto bg-gray-200 dark:bg-gray-700 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <FileText className="text-gray-500 dark:text-gray-400" size={28} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No proposals found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {!loading && !error && proposals.length > 0 && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="hidden md:grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div>Title</div>
              <div>Category</div>
              <div>Difficulty</div>
              <div>Status</div>
              <div>Created</div>
              <div className="text-center">Actions</div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {proposals.map((proposal) => (
                <div
                  key={proposal._id}
                  className="block md:grid md:grid-cols-[3fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="mb-3 md:mb-0">
                    <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Title
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {proposal.title}
                    </div>
                  </div>

                  <div className="mb-3 md:mb-0">
                    <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Category
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {proposal.category.join(", ")}
                    </div>
                  </div>

                  <div className="mb-3 md:mb-0">
                    <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Difficulty
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {proposal.difficulty}
                    </div>
                  </div>

                  <div className="mb-3 md:mb-0">
                    <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                        proposal.status
                      )}`}
                    >
                      {proposal.status || "pending"}
                    </span>
                  </div>

                  <div className="mb-4 md:mb-0">
                    <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Created
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex md:justify-center">
                    <button
                      onClick={() => handleEdit(proposal.slug)}
                      className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                    >
                      <PenLine size={16} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}
    </div>
  );
};

export default MyProposals;