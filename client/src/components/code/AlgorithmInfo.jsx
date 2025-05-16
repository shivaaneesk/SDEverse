import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Section = ({ title, content }) => {
  if (!content) return null;

  const formattedContent = content
  .replace(/\\n/g, "\n")      // fix literal \n
  .replace(/\\\\/g, "\\");    // unescape \\ => \


  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h2>
      <div className="prose dark:prose-invert mt-4">
        <ReactMarkdown
          children={formattedContent}
          remarkPlugins={[remarkMath]}
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
        />
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
