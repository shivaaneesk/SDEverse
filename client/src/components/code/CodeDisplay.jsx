import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";

const CodeDisplay = ({ algorithm }) => {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = algorithm.codes?.[selectedLangIndex]?.code || "";
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("No code to copy!");
    }
  };

  const currentCode = algorithm.codes?.[selectedLangIndex];

  if (!algorithm.codes?.length) return null;

  return (
    <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg overflow-hidden border border-gray-700 mt-8">
      {" "}
      {/* Darker background for code block wrapper */}
      {/* Header with title and copy button */}
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Code Example</h2>
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
      {/* Language Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-700 bg-gray-800 px-2 py-1">
        {algorithm.codes.map((code, index) => (
          <button
            key={index}
            onClick={() => setSelectedLangIndex(index)}
            className={`px-4 py-2 font-mono text-sm whitespace-nowrap border-b-2 transition-all duration-200 ${
              selectedLangIndex === index
                ? "border-blue-500 text-blue-400 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-t-md"
            }`}
          >
            {code.language}
          </button>
        ))}
      </div>
      {/* SyntaxHighlighter for the code block */}
      <div className="relative">
        {" "}
        {/* Added relative for potential absolute positioning of custom elements */}
        <SyntaxHighlighter
          language={currentCode.language?.toLowerCase() || "text"}
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
          {currentCode.code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeDisplay;
