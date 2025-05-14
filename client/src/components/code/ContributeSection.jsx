import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const ContributeSection = ({ algorithmId }) => {
  const navigate = useNavigate();

  const handleContribute = () => {
    navigate(`/algorithms/${algorithmId}/contribute`);
  };

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={handleContribute}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        <Sparkles size={20} />
        <span className="font-medium">Contribute</span>
      </button>
    </div>
  );
};

export default ContributeSection;
