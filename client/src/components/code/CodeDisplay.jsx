import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeDisplay = ({ algorithm }) => {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = algorithm.codes?.[selectedLangIndex]?.code || "";
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCode = algorithm.codes?.[selectedLangIndex];

  if (!algorithm.codes?.length) return null;

  return (
    <div>
      {/* Header with title and copy button */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Code Example
        </h2>
        <button
          onClick={handleCopy}
          title="Copy code"
          aria-label="Copy code"
          className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          {copied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>

      {/* Language Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-300 dark:border-gray-600 mb-4">
        {algorithm.codes.map((code, index) => (
          <button
            key={index}
            onClick={() => setSelectedLangIndex(index)}
            className={`px-4 py-2 font-mono text-sm whitespace-nowrap border-b-2 transition-all duration-150 ${
              selectedLangIndex === index
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600"
            }`}
          >
            {code.language}
          </button>
        ))}
      </div>

      {/* SyntaxHighlighter for the code block */}
      <SyntaxHighlighter
        language={currentCode.language?.toLowerCase() || "text"}
        style={materialDark}
        wrapLongLines
        showLineNumbers
      >
        {currentCode.code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeDisplay;
