import { Sparkles } from "lucide-react";

const ContributeSection = () => {
  const handleContribute = () => {
    console.log("Open contribute modal or route");
  };

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={handleContribute}
        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 shadow-md transition"
      >
        <Sparkles size={20} />
        <span>Contribute</span>
      </button>
    </div>
  );
};

export default ContributeSection;
