import { motion } from "framer-motion";
import { DotLoader } from "react-spinners";
import AlgorithmInfo from "../components/code/AlgorithmInfo";
import AlgorithmMetadata from "../components/code/AlgorithmMetadata";
import CodeDisplay from "../components/code/CodeDisplay";

const AlgorithmPreview = ({ algorithm }) => {
  if (!algorithm) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
        <DotLoader color="#3B82F6" size={60} />
        <p className="mt-4 text-base">Loading algorithm preview...</p>
      </div>
    );
  }

  return (
    // KEY CHANGE: Removed all width, max-width, padding, and overflow classes.
    // This component now naturally fills the space of its parent section.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AlgorithmInfo algorithm={algorithm} />
      <AlgorithmMetadata algorithm={algorithm} />
      <CodeDisplay algorithm={algorithm} />
    </motion.div>
  );
};

export default AlgorithmPreview;