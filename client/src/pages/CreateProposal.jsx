import ProposalForm from "../components/forms/ProposalForm";
import { useDispatch, useSelector } from "react-redux";
import { submitNewProposal } from "../features/proposal/proposalSlice";
import { fetchCategories } from "../features/algorithm/algorithmSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const CreateProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();

  const categories = useSelector((state) => state.algorithm.categories);
  const [formData, setFormData] = useState(null);

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
    try {
      await dispatch(
        submitNewProposal({ ...formData, algorithmSlug: slug })
      ).unwrap();
      navigate(-1);
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProposalForm
        categories={categories}
        onSave={handleFormChange}
        onCancel={handleCancel}
      />

      <div className="flex justify-end gap-4">
        <button
          onClick={handleCancel}
          className="bg-gray-500 text-white px-6 py-2 rounded-xl"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData || !formData.title.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Submit Proposal
        </button>
      </div>
    </div>
  );
};

export default CreateProposal;