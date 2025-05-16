import { useEffect, useState } from "react";
import ProposalForm from "../components/forms/ProposalForm";
import { useDispatch, useSelector } from "react-redux";
import { fetchProposalDetails, saveUpdatedProposal } from "../features/proposal/proposalSlice";
import { useNavigate, useParams } from "react-router-dom";

const EditProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();
  const { currentProposal, categories, loading } = useSelector((state) => state.proposal);
  const [formData, setFormData] = useState(null);

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
    try {
      await dispatch(saveUpdatedProposal({ slug, proposalData: formData })).unwrap();
      navigate(-1);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  if (loading || !formData) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProposalForm proposal={formData} categories={categories} onSave={handleFormChange} />

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-6 py-2 rounded-xl"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.title?.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProposal;
