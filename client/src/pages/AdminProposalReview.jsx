import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProposals,
  reviewExistingProposal,
} from "../features/proposal/proposalSlice";
import { FileText } from "lucide-react";
import AlgorithmPreview from "./AlgorithmPreview";

const AdminProposalReview = () => {
  const dispatch = useDispatch();
  const { proposals, loading, error } = useSelector((state) => state.proposal);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [expandedProposalId, setExpandedProposalId] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const params = {
      page,
      limit,
      search,
      status: statusFilter || undefined,
    };
    dispatch(fetchProposals(params));
  }, [dispatch, page, limit, search, statusFilter]);

  const toggleExpand = (proposal) => {
    const isAlreadyOpen = expandedProposalId === proposal._id;
    setExpandedProposalId(isAlreadyOpen ? null : proposal._id);
    setReviewStatus(proposal.status || "pending");
    setReviewComment(proposal.reviewComment || "");
  };

  const handleReviewSubmit = async (e, proposal) => {
    e.preventDefault();
    setReviewLoading(true);

    try {
      await dispatch(
        reviewExistingProposal({
          slug: proposal.slug,
          reviewData: {
            status: reviewStatus,
            reviewComment,
          },
        })
      ).unwrap();

      alert("Proposal reviewed successfully.");
      setExpandedProposalId(null);
      dispatch(fetchProposals({ page, limit, search, status: statusFilter }));
    } catch (err) {
      alert("Failed to review proposal: " + (err.message || err));
    }
    setReviewLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 flex items-center justify-center gap-2 text-gray-800 dark:text-white">
        <FileText size={32} /> Users Proposal Review
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title, category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-md w-64 max-w-full"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="merged">Merged</option>
        </select>
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading proposals...</p>
      )}
      {error && (
        <p className="text-center text-red-500 font-semibold">
          Error:{" "}
          {typeof error === "string"
            ? error
            : error.message || JSON.stringify(error)}
        </p>
      )}

      {!loading && proposals.length === 0 && (
        <p className="text-center text-gray-400">No proposals found.</p>
      )}

      {!loading && proposals.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200 table-auto">
            <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 max-w-[150px] w-[20%] truncate">
                  Title
                </th>
                <th className="px-4 py-3 max-w-[120px] w-[15%] truncate">
                  Contributor
                </th>
                <th className="px-4 py-3 max-w-[150px] w-[20%] truncate">
                  Category
                </th>
                <th className="px-4 py-3 w-[10%]">Difficulty</th>
                <th className="px-4 py-3 w-[10%]">Status</th>
                <th className="px-4 py-3 w-[15%]">Created</th>
                <th className="px-4 py-3 text-center w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <React.Fragment key={proposal._id}>
                  <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-3 max-w-[150px] truncate">
                      {proposal.title}
                    </td>
                    <td className="px-4 py-3 max-w-[120px] truncate">
                      {proposal.contributor?.username || "N/A"}
                    </td>
                    <td className="px-4 py-3 max-w-[150px] truncate">
                      {proposal.category.join(", ")}
                    </td>
                    <td className="px-4 py-3">{proposal.difficulty}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          proposal.status === "approved"
                            ? "text-green-700 bg-green-100"
                            : proposal.status === "rejected"
                            ? "text-red-700 bg-red-100"
                            : proposal.status === "merged"
                            ? "text-blue-700 bg-blue-100"
                            : "text-yellow-700 bg-yellow-100"
                        }`}
                      >
                        {proposal.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleExpand(proposal)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:underline"
                      >
                        {expandedProposalId === proposal._id
                          ? "Close"
                          : "Review"}
                      </button>
                    </td>
                  </tr>

                  {expandedProposalId === proposal._id && (
                    <tr className="bg-gray-50 dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-700">
                      <td colSpan="7" className="p-4">
                        <AlgorithmPreview algorithm={proposal} />

                        <form
                          onSubmit={(e) => handleReviewSubmit(e, proposal)}
                          className="mt-4 space-y-4"
                        >
                          <div className="flex items-center gap-4">
                            <label className="font-semibold">
                              Review Status:
                              <select
                                value={reviewStatus}
                                onChange={(e) =>
                                  setReviewStatus(e.target.value)
                                }
                                className="ml-2 p-2 border rounded-md"
                              >
                                <option value="approved">Approve</option>
                                <option value="rejected">Reject</option>
                                <option value="pending">Pending</option>
                              </select>
                            </label>
                          </div>

                          <div>
                            <label className="block font-semibold">
                              Review Comment:
                            </label>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="w-full mt-1 p-2 border rounded-md"
                              rows={4}
                              placeholder="Optional comment for contributor"
                            />
                          </div>

                          <div className="flex justify-end gap-4">
                            <button
                              type="button"
                              onClick={() => setExpandedProposalId(null)}
                              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={reviewLoading}
                              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              Submit Review
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProposalReview;
