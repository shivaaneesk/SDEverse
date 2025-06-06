import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DotLoader } from "react-spinners";
import ProposalForm from "../components/forms/ProposalForm";
import { submitNewProposal } from "../features/proposal/proposalSlice";
import { fetchCategories } from "../features/algorithm/algorithmSlice";

const CreateProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();

  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.algorithm
  );
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [categories, dispatch]);

  const handleFormChange = (data) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setSubmitting(true);
    try {
      await dispatch(
        submitNewProposal({ ...formData, algorithmSlug: slug })
      ).unwrap();
      navigate(-1);
    } catch (err) {
      console.error("Create failed", err);
    } finally {
      setSubmitting(false);
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

  return (
    <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 lg:p-10 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Create New Proposal
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Submit a new algorithm proposal for community review
          </p>
        </div>
        
        <div className="p-6 md:p-8 lg:p-10">
          <ProposalForm
            categories={categories}
            onSave={handleFormChange}
            onCancel={handleCancel}
          />
        </div>

        <div className="p-6 md:p-8 lg:p-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData || !formData.title.trim() || submitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center shadow-lg hover:shadow-xl"
              type="button"
            >
              {submitting ? (
                <DotLoader color="#fff" size={20} className="mr-2" />
              ) : null}
              Submit Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;