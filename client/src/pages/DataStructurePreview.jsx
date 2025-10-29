import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Code2 } from "lucide-react";
import { selectCurrentUser } from "../features/auth/authSlice";
import { MarkdownRenderer } from "./CommentSection";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import CodeDisplay from "../components/code/CodeDisplay";
import DataStructureOperations from "../components/code/DataStructureOperations";


// Content block component similar to AlgorithmContentBlock
const DataStructureContentBlock = ({ title, content, children }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 last:mb-0">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pb-3 mb-5 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h2>
      {content ? (
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
          <MarkdownRenderer>{content}</MarkdownRenderer>
        </div>
      ) : children ? (
        children
      ) : (
        <p className="text-gray-500 dark:text-gray-400 italic">Not provided</p>
      )}
    </div>
  );
};

const DataStructurePreview = ({ dataStructure }) => {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === "admin";

  const renderFullImplementations = () => {
    // Adapt all implementations to match CodeDisplay expected format
    const adaptedAlgorithm = {
      codes: dataStructure.fullImplementations.map(impl => ({
        language: impl.language?.trim() || "Unknown",
        code: impl.code?.trim() || "No code available."
      }))
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <CodeDisplay algorithm={adaptedAlgorithm} />
        
        {isAdmin && (
          <div className="mt-4">
            <button
              className="text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => toast.info("Edit implementation functionality coming soon!")}
              aria-label="Edit full implementations"
            >
              Edit Implementations
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  useEffect(() => {
    console.log("DataStructure updated:", dataStructure);
  }, [dataStructure]);

  if (!dataStructure) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center text-gray-600 dark:text-gray-400 text-lg py-12 px-4"
      >
        Loading data structure preview...
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Definition */}
      <DataStructureContentBlock
        title="Definition"
        content={dataStructure.definition}
      />

      {/* Characteristics */}
      <DataStructureContentBlock
        title="Characteristics"
        content={dataStructure.characteristics}
      />

      {/* Category */}
      <DataStructureContentBlock title="Category">
        <p className="text-gray-700 dark:text-gray-300">
          {Array.isArray(dataStructure.category) && dataStructure.category.length > 0
            ? dataStructure.category.join(", ")
            : "Not provided"}
        </p>
      </DataStructureContentBlock>

      {/* Type */}
      <DataStructureContentBlock title="Type">
        <p className="text-gray-700 dark:text-gray-300">
          {dataStructure.type || "Not provided"}
        </p>
      </DataStructureContentBlock>

      {/* Difficulty */}
      <DataStructureContentBlock title="Difficulty">
        <p className={`text-base font-medium ${
            dataStructure.difficulty === 'Easy' ? 'text-green-500' :
            dataStructure.difficulty === 'Medium' ? 'text-yellow-500' :
            dataStructure.difficulty === 'Hard' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
          }`}>
          {dataStructure.difficulty || "Not provided"}
        </p>
      </DataStructureContentBlock>

      {/* References */}
      <DataStructureContentBlock title="References">
        {dataStructure.references && dataStructure.references.length > 0 ? (
          <ul className="list-disc pl-6 text-blue-600 dark:text-blue-400 space-y-2">
            {dataStructure.references.map((ref, index) => (
              <li key={index}>
                <a
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-base break-all"
                >
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No references available</p>
        )}
      </DataStructureContentBlock>

      {/* Video Links */}
      <DataStructureContentBlock title="Video Links">
        {dataStructure.videoLinks && dataStructure.videoLinks.length > 0 ? (
          <ul className="list-disc pl-6 text-blue-600 dark:text-blue-400 space-y-2">
            {dataStructure.videoLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-base break-all"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No video links available</p>
        )}
      </DataStructureContentBlock>

      {/* Applications */}
      <DataStructureContentBlock title="Applications">
        {dataStructure.applications && dataStructure.applications.length > 0 ? (
          <div className="space-y-3">
            {dataStructure.applications.map((app, index) => (
              <div key={index} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {app.domain || "N/A"}
                </p>
                {app.examples && app.examples.length > 0 && (
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600 dark:text-gray-300">
                    {app.examples.map((example, i) => (
                      <li key={i}>{example}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No applications available</p>
        )}
      </DataStructureContentBlock>

      {/* Comparisons */}
      <DataStructureContentBlock title="Comparisons">
        {dataStructure.comparisons && dataStructure.comparisons.length > 0 ? (
          <div className="space-y-3">
            {dataStructure.comparisons.map((comp, index) => (
              <div key={index} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Compared with: {comp.with || "N/A"}
                </p>
                {comp.advantages && comp.advantages.length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Advantages:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600 dark:text-gray-300">
                      {comp.advantages.map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comp.disadvantages && comp.disadvantages.length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Disadvantages:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600 dark:text-gray-300">
                      {comp.disadvantages.map((disadv, i) => (
                        <li key={i}>{disadv}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comp.whenToUse && (
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">When to Use:</p>
                    <p className="text-gray-600 dark:text-gray-300 ml-4">{comp.whenToUse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No comparisons available</p>
        )}
      </DataStructureContentBlock>

      {/* Tags */}
      <DataStructureContentBlock title="Tags">
        {dataStructure.tags && dataStructure.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dataStructure.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No tags available</p>
        )}
      </DataStructureContentBlock>

      {/* Operations */}
      <DataStructureOperations dataStructure={dataStructure} isAdmin={isAdmin} />

      {/* Full Implementation */}
      <DataStructureContentBlock title="Full Implementation">
        {Array.isArray(dataStructure.fullImplementations) && dataStructure.fullImplementations.length > 0 ? (
          renderFullImplementations()
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No implementations available</p>
        )}
      </DataStructureContentBlock>
    </div>
  );
};

export default DataStructurePreview;