import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-full bg-gray-900 text-gray-100 rounded-lg shadow-lg border border-gray-700 mt-6 overflow-hidden box-border"
    >
      <div className="flex flex-wrap justify-between items-center p-3 sm:p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold text-white truncate flex-1">
          Code Example
        </h2>
        <button
          onClick={handleCopy}
          title="Copy code"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
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
      <div className="flex border-b border-gray-700 bg-gray-800 px-2 py-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {algorithm.codes.map((code, index) => (
          <button
            key={index}
            onClick={() => setSelectedLangIndex(index)}
            className={`px-3 sm:px-4 py-2 font-mono text-sm whitespace-nowrap border-b-2 transition-all duration-200 ${
              selectedLangIndex === index
                ? "border-blue-500 text-blue-400 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-t-md"
            }`}
          >
            {code.language}
          </button>
        ))}
      </div>
      <div className="max-w-full box-border">
        <SyntaxHighlighter
          language={currentCode.language?.toLowerCase() || "text"}
          style={materialDark}
          showLineNumbers
          wrapLongLines={true}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
            lineHeight: "1.6",
            backgroundColor: "#212121",
            boxSizing: "border-box",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            maxWidth: "100%",
            display: "block",
          }}
          codeTagProps={{
            className: "font-mono",
            style: {
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              maxWidth: "100%",
              display: "block",
            },
          }}
        >
          {currentCode.code || ""}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
};

export default CodeDisplay;