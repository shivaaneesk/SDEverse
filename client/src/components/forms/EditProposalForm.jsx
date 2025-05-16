import { useState, useEffect } from "react";
import AlgorithmPreview from "../../pages/AlgorithmPreview";
import EditAlgorithmForm from "./EditAlgorithmForm";

const ProposalPreview = ({ proposal }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-center dark:text-white">Proposal Preview</h2>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
      <div><strong>Title:</strong> {proposal.title}</div>
      <div><strong>Type:</strong> {proposal.type}</div>
      <div><strong>Description:</strong> {proposal.description}</div>
      {["create", "update"].includes(proposal.type) && (
        <div className="pt-6 border-t border-gray-300 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Proposed Algorithm</h3>
          <AlgorithmPreview algorithm={proposal.proposedAlgorithm} />
        </div>
      )}
    </div>
  </div>
);

const EditProposalForm = ({ initialProposal = {}, onSave, onCancel, categories }) => {
  const [proposalData, setProposalData] = useState({
    title: "",
    description: "",
    type: "create",
    algorithmId: null,
    proposedAlgorithm: {
      title: "",
      problemStatement: "",
      intuition: "",
      explanation: "",
      complexity: { time: "", space: "" },
      difficulty: "Easy",
      category: [],
      tags: [],
      links: [],
      codes: [{ language: "", code: "" }],
    },
  });

  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (initialProposal) {
      setProposalData({
        title: initialProposal.title || "",
        description: initialProposal.description || "",
        type: initialProposal.type || "create",
        algorithmId: initialProposal.algorithmId || null,
        proposedAlgorithm: initialProposal.proposedAlgorithm || {
          title: "",
          problemStatement: "",
          intuition: "",
          explanation: "",
          complexity: { time: "", space: "" },
          difficulty: "Easy",
          category: [],
          tags: [],
          links: [],
          codes: [{ language: "", code: "" }],
        },
      });
    }
  }, [initialProposal]);

  const handleProposalChange = (field, value) => {
    setProposalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAlgorithmUpdate = (updatedAlgorithm) => {
    setProposalData((prev) => ({
      ...prev,
      proposedAlgorithm: updatedAlgorithm,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl space-y-8">
      {/* Tabs */}
      <div className="flex gap-4 border-b pb-4 dark:border-gray-700">
        {["Edit", "Preview"].map((tab, i) => (
          <button
            key={tab}
            onClick={() => setPreview(i === 1)}
            className={`text-sm font-medium px-4 py-2 rounded-md transition-all ${
              (i === 1 ? preview : !preview)
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {preview ? (
        <ProposalPreview proposal={proposalData} />
      ) : (
        <div className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Proposal Title
            </label>
            <input
              id="title"
              className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
              value={proposalData.title}
              onChange={(e) => handleProposalChange("title", e.target.value)}
            />

            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
              value={proposalData.description}
              onChange={(e) => handleProposalChange("description", e.target.value)}
            />

            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              id="type"
              className="w-full p-3 border rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
              value={proposalData.type}
              onChange={(e) => handleProposalChange("type", e.target.value)}
            >
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          {/* Algorithm Editor */}
          {["create", "update"].includes(proposalData.type) && (
            <EditAlgorithmForm
              algorithm={proposalData.proposedAlgorithm}
              categories={categories}
              onSave={handleAlgorithmUpdate}
              onCancel={() => {}}
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(proposalData)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
            >
              Submit Proposal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProposalForm;
