import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DotLoader } from "react-spinners";
import ProposalForm from "../components/forms/ProposalForm";
import { 
  fetchProposalDetails, 
  saveUpdatedProposal 
} from "../features/proposal/proposalSlice";

const EditProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const { 
    currentProposal, 
    loading: proposalLoading 
  } = useSelector((state) => state.proposal);
  
  const { categories } = useSelector((state) => state.algorithm);
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProposalDetails(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentProposal) {
      setFormData(currentProposal);
    }
  }, [currentProposal]);

  const handleFormChange = (data) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setSubmitting(true);
    try {
      await dispatch(
        saveUpdatedProposal({ slug, proposalData: formData })
      ).unwrap();
      navigate(-1);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (proposalLoading || !formData) {
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
            Edit Proposal
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Update your algorithm proposal details
          </p>
        </div>
        
        <div className="p-6 md:p-8 lg:p-10">
          <ProposalForm 
            proposal={formData} 
            categories={categories} 
            onSave={handleFormChange} 
          />
        </div>

        <div className="p-6 md:p-8 lg:p-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.title?.trim() || submitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center shadow-lg hover:shadow-xl"
              type="button"
            >
              {submitting ? (
                <DotLoader color="#fff" size={20} className="mr-2" />
              ) : null}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProposal;