import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

function ensureBlankLineBeforeLists(markdown) {
  const lines = markdown.split("\n");
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const previous = lines[i - 1] || "";

    const isListItem = /^(\s*)([-*+]|\d+\.)\s+/.test(current);
    const isPrevEmpty = previous.trim() === "";

    if (isListItem && !isPrevEmpty) {
      fixedLines.push(""); // Insert a blank line before the list
    }

    fixedLines.push(current);
  }

  const result = fixedLines.join("\n");
  return result;
}

const Section = ({ title, content }) => {
  if (!content) return null;

  const formattedContent = ensureBlankLineBeforeLists(
    content.replace(/\\n/g, "\n").replace(/\\\\/g, "\\")
  );

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h2>
      <div className="prose dark:prose-invert mt-4 max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  {...props}
                  PreTag="div"
                  language={match[1]}
                  style={oneDark}
                  customStyle={{
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    fontSize: "0.875rem",
                    overflowX: "auto",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">
                  {children}
                </code>
              );
            },
          }}
        >
          {formattedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

const AlgorithmInfo = ({ algorithm }) => {
  return (
    <>
      <Section title="Problem Statement" content={algorithm.problemStatement} />
      <Section title="Intuition" content={algorithm.intuition} />
      <Section title="Explanation" content={algorithm.explanation} />
    </>
  );
};

export default AlgorithmInfo;
