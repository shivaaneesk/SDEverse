import { motion } from "framer-motion";
import AlgorithmInfo from "../components/code/AlgorithmInfo";
import AlgorithmMetadata from "../components/code/AlgorithmMetadata";
import CodeDisplay from "../components/code/CodeDisplay";

const AlgorithmPreview = ({ algorithm }) => {
  if (!algorithm) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-lg">Loading algorithm preview...</p>
        </motion.div>
      </div>
    );
  }

  return (
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
