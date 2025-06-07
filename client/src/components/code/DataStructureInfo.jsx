import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { MarkdownRenderer } from "../../pages/CommentSection"; // Adjust path as needed
import { Tooltip } from "react-tooltip";
import { useMemo } from "react";
import clsx from "clsx";

// Component to display core data structure information
const DataStructureInfo = ({ dataStructure, isAdmin = false }) => {
  if (!dataStructure) return null;

  // Memoize category rendering to prevent unnecessary re-renders
  const categories = useMemo(() => {
    return Array.isArray(dataStructure.category)
      ? dataStructure.category.join(", ")
      : dataStructure.category || "N/A";
  }, [dataStructure.category]);

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  // Animation variants for child elements
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  // Render a markdown section with tooltip support
  const renderMarkdownSection = (title, content, icon) => (
    <motion.div
      variants={itemVariants}
      className="space-y-3"
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {icon} {title}
      </h3>
      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
        <MarkdownRenderer>{content || `No ${title.toLowerCase()} provided.`}</MarkdownRenderer>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={clsx(
        "p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg",
        "border border-gray-200 dark:border-gray-800",
        "max-w-4xl mx-auto"
      )}
    >
      {/* Title and Metadata */}
      <div className="space-y-3 mb-6">
        <h2
          className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
          data-tooltip-id="title-tooltip"
          data-tooltip-content="Data structure title"
        >
          {dataStructure.title || "Untitled"}
        </h2>
        <Tooltip
          id="title-tooltip"
          place="top"
          className="bg-gray-800 text-white text-sm rounded-md px-2 py-1"
        />
        <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500 dark:text-gray-400">
          <p>
            <span className="font-medium text-gray-700 dark:text-gray-300">Categories:</span>{" "}
            {categories}
          </p>
          <p>
            <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>{" "}
            {dataStructure.type || "N/A"}
          </p>
        </div>
      </div>

      {/* Definition */}
      {renderMarkdownSection("Definition", dataStructure.definition, <Info size={18} className="text-blue-500" />)}

      {/* Characteristics */}
      {dataStructure.characteristics && (
        <motion.div variants={itemVariants} className="mt-6">
          {renderMarkdownSection("Characteristics", dataStructure.characteristics, <Info size={18} className="text-blue-500" />)}
        </motion.div>
      )}

      {/* Visualization */}
      {dataStructure.visualization && (
        <motion.div variants={itemVariants} className="mt-6 space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Info size={18} className="text-blue-500" /> Visualization
          </h3>
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src={dataStructure.visualization}
            alt={`${dataStructure.title || "Data Structure"} Visualization`}
            className="w-full h-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-image.png";
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default DataStructureInfo;