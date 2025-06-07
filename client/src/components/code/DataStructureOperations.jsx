import { useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { MarkdownRenderer } from "../../pages/CommentSection"; // Adjust path as needed

const DataStructureOperations = ({ dataStructure, isAdmin = false }) => {
  const [openOperationIndex, setOpenOperationIndex] = useState(null);
  const [openFullImplIndex, setOpenFullImplIndex] = useState(null);

  const toggleOperation = useCallback((index) => {
    setOpenOperationIndex((prev) => (prev === index ? null : index));
  }, []);

  const toggleFullImplementation = useCallback((index) => {
    setOpenFullImplIndex((prev) => (prev === index ? null : index));
  }, []);

  const copyCode = useCallback(async (code) => {
    if (!code?.trim()) {
      toast.error("No code to copy!", { autoClose: 2000 });
      return;
    }
    try {
      await navigator.clipboard.writeText(code.trim());
      toast.success("Code copied to clipboard!", { autoClose: 2000 });
    } catch (err) {
      toast.error("Failed to copy code.", { autoClose: 2000 });
    }
  }, []);

  const renderOperation = (operation, index) => {
    const isOpen = openOperationIndex === index;
    const operationId = `operation-${index}`;
    const [selectedLangIndex, setSelectedLangIndex] = useState(0);

    return (
      <motion.div
        key={operationId}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <button
          onClick={() => toggleOperation(index)}
          className="w-full flex justify-between items-center text-left text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          data-tooltip-id={operationId}
          data-tooltip-content={`Toggle ${operation.name?.trim() ||
            "operation"} details`}
          aria-expanded={isOpen}
          aria-controls={`operation-content-${index}`}
        >
          <span>{operation.name?.trim() || `Operation ${index + 1}`}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </motion.div>
        </button>
        <Tooltip
          id={operationId}
          place="top"
          className="z-50 text-xs bg-gray-800 text-white rounded px-2 py-1"
        />

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id={`operation-content-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4 overflow-hidden"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Description
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                  <MarkdownRenderer>
                    {operation.description?.trim() || "No description provided."}
                  </MarkdownRenderer>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium">Time Complexity:</span>{" "}
                  {operation.complexity?.time?.trim() || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Space Complexity:</span>{" "}
                  {operation.complexity?.space?.trim() || "N/A"}
                </p>
              </div>
              {Array.isArray(operation.implementations) &&
                operation.implementations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Implementations
                    </h4>
                    {/* Tabbed Interface for Implementations */}
                    <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg overflow-hidden border border-gray-700 mt-2">
                      <div className="flex overflow-x-auto border-b border-gray-700 bg-gray-800 px-2 py-1">
                        {operation.implementations.map((impl, implIndex) => (
                          <button
                            key={implIndex}
                            onClick={() => setSelectedLangIndex(implIndex)}
                            className={`px-4 py-2 font-mono text-sm whitespace-nowrap border-b-2 transition-all duration-200 ${selectedLangIndex ===
                              implIndex
                                ? "border-blue-500 text-blue-400 font-bold"
                                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-t-md"
                              }`}
                          >
                            {impl.codeDetails?.language?.trim() ||
                              `Code ${implIndex + 1}`}
                          </button>
                        ))}
                      </div>
                      <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-b-md border border-gray-300 dark:border-gray-700">
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                              Explanation
                            </h5>
                            <div className="prose prose-xs dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                              <MarkdownRenderer>
                                {operation.implementations[selectedLangIndex]?.explanation?.trim() ||
                                  "No explanation provided."}
                              </MarkdownRenderer>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-xs text-gray-700 dark:text-gray-300">
                            <p>
                              <span className="font-medium">Time Complexity:</span>{" "}
                              {operation.implementations[selectedLangIndex]?.complexity?.time?.trim() ||
                                "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Space Complexity:</span>{" "}
                              {operation.implementations[selectedLangIndex]?.complexity?.space?.trim() ||
                                "N/A"}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                              Code
                            </h5>
                            <div className="relative rounded-md overflow-hidden">
                              {operation.implementations[selectedLangIndex]?.codeDetails?.code?.trim() ? (
                                <>
                                  <SyntaxHighlighter
                                    language={
                                      operation.implementations[
                                        selectedLangIndex
                                      ]?.codeDetails?.language
                                        ?.toLowerCase()
                                        .trim() || "javascript"
                                    }
                                    style={materialDark}
                                    showLineNumbers
                                    wrapLongLines
                                    customStyle={{
                                      padding: "1rem",
                                      borderRadius: "0.375rem",
                                      backgroundColor: "#212121", // Darker background for code
                                      fontSize: "0.75rem",
                                      lineHeight: "1.5",
                                    }}
                                  >
                                    {operation.implementations[
                                      selectedLangIndex
                                    ]?.codeDetails?.code.trim()}
                                  </SyntaxHighlighter>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      copyCode(
                                        operation.implementations[
                                          selectedLangIndex
                                        ]?.codeDetails?.code
                                      )
                                    }
                                    className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    aria-label="Copy code"
                                  >
                                    <Copy className="h-3 w-3" /> Copy
                                  </motion.button>
                                </>
                              ) : (
                                <pre className="p-4 bg-gray-900 text-white text-xs rounded-md overflow-x-auto">
                                  <code>No code available.</code>
                                </pre>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              {isAdmin && (
                <div className="mt-4">
                  <button
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() =>
                      toast.info("Edit operation functionality coming soon!")
                    }
                    aria-label={`Edit operation ${operation.name?.trim() ||
                      `Operation ${index + 1}`}`}
                  >
                    Edit Operation
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderFullImplementation = (impl, index) => {
    const isOpen = openFullImplIndex === index;
    const implId = `full-impl-${index}`;
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
      copyCode(impl.code);
    }, [copyCode, impl.code]);

    return (
      <motion.div
        key={implId}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <button
          onClick={() => toggleFullImplementation(index)}
          className="w-full flex justify-between items-center text-left text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          data-tooltip-id={implId}
          data-tooltip-content={`Toggle ${impl.language?.trim() ||
            "implementation"} code`}
          aria-expanded={isOpen}
          aria-controls={`full-impl-content-${index}`}
        >
          <span>Full Implementation: {impl.language?.trim() || "Unknown"}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </motion.div>
        </button>
        <Tooltip
          id={implId}
          place="top"
          className="z-50 text-xs bg-gray-800 text-white rounded px-2 py-1"
        />

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id={`full-impl-content-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-3 overflow-hidden"
            >
              <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg overflow-hidden border border-gray-700 mt-2">
                <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">
                    Code Example
                  </h2>
                  <button
                    onClick={handleCopy}
                    title="Copy code"
                    aria-label="Copy code"
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <SyntaxHighlighter
                    language={impl.language?.toLowerCase().trim() || "text"}
                    style={materialDark}
                    wrapLongLines
                    showLineNumbers
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      borderRadius: "0 0 0.5rem 0.5rem",
                      backgroundColor: "#212121",
                    }}
                    codeTagProps={{
                      className: "font-mono",
                    }}
                  >
                    {impl.code?.trim()}
                  </SyntaxHighlighter>
                </div>
              </div>
              {isAdmin && (
                <div className="mt-2">
                  <button
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() =>
                      toast.info("Edit implementation functionality coming soon!")
                    }
                    aria-label={`Edit implementation in ${impl.language?.trim() ||
                      "Unknown"}`}
                  >
                    Edit Implementation
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 font-sans"
    >
      {/* Operations */}
      {Array.isArray(dataStructure.operations) &&
        dataStructure.operations.length > 0 && (
          <section aria-labelledby="operations-heading">
            <h3
              id="operations-heading"
              className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4"
            >
              <Code2 className="h-5 w-5" aria-hidden="true" /> Operations
            </h3>
            <div className="space-y-4">
              {dataStructure.operations.map(renderOperation)}
            </div>
          </section>
        )}

      {/* Full Implementations */}
      {Array.isArray(dataStructure.fullImplementations) &&
        dataStructure.fullImplementations.length > 0 && (
          <section aria-labelledby="full-implementations-heading">
            <h3
              id="full-implementations-heading"
              className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4"
            >
              <Code2 className="h-5 w-5" aria-hidden="true" /> Full
              Implementations
            </h3>
            <div className="space-y-4">
              {dataStructure.fullImplementations.map(renderFullImplementation)}
            </div>
          </section>
        )}
    </motion.div>
  );
};

export default DataStructureOperations;