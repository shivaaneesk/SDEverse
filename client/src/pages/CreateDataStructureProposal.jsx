import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DotLoader } from "react-spinners";
import DataStructureProposalForm from "../components/forms/DataStructureProposalForm";

import { fetchDataStructureCategories } from "../features/dataStructure/dataStructureSlice";
import { submitNewProposal } from "../features/dataStructureProposal/dataStructureProposalSlice";
import { toast } from "react-toastify";

const CreateDataStructureProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    categories: dsCategories,
    categoriesLoading,
    error: dsCategoriesError,
  } = useSelector((state) => state.dataStructure);

  const { loading: createLoading } = useSelector(
    (state) => state.dataStructureProposal
  );

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!dsCategories.length && !categoriesLoading) {
      dispatch(fetchDataStructureCategories());
    }
  }, [dsCategories.length, categoriesLoading, dispatch]);

  const handleFormChange = (data) => {
    setFormData(data);
  };

  const handleSubmit = async (data) => {
    if (!data) {
      toast.error("Form data is not initialized.");
      return;
    }

    try {
      await dispatch(submitNewProposal(data)).unwrap();
      toast.success("Data Structure proposal submitted successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Data Structure proposal creation failed:", err);

      const errorMessage =
        err.message || "Something went wrong during submission.";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotLoader color="#3B82F6" size={60} />
      </div>
    );
  }

  if (dsCategoriesError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Error loading data structure categories: {dsCategoriesError}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create New Data Structure Proposal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Submit a new data structure for review and addition.
          </p>
        </div>
        <div className="p-6">
          <DataStructureProposalForm
            initialData={{}}
            dsCategories={dsCategories}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              type="button"
            >
              Cancel
            </button>
            <button
              disabled={createLoading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              type="button"
            >
              {createLoading ? (
                <DotLoader color="#fff" size={20} className="mr-2" />
              ) : null}
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDataStructureProposal;
