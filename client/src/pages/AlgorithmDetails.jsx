import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlgorithmBySlug,
  voteOnAlgorithm,
} from "../features/algorithm/algorithmSlice";
import Loader from "../components/Loader";
import { Copy, Check, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const AlgorithmDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, user } = useSelector((state) => state.auth);
  const { algorithm, loading, error } = useSelector((state) => state.algorithm);
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchAlgorithmBySlug(slug));
    }
  }, [slug, dispatch]);

  const handleCopy = () => {
    const code = algorithm.codes?.[selectedLangIndex]?.code || "";
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = (type) => {
    if (!token || !user) {
      alert("You must be logged in to vote.");
      return;
    }

    if (!algorithm?.slug) return;

    dispatch(
      voteOnAlgorithm({
        slug: algorithm.slug,
        voteData: { voteType: type, userId: user._id },
        token,
      })
    );
  };

  const currentUserVoteType = (() => {
    if (!user || !algorithm) return null;

    if (algorithm.upvotedBy?.includes(user._id)) return "upvote";
    if (algorithm.downvotedBy?.includes(user._id)) return "downvote";

    return null;
  })();

  if (loading) return <Loader />;
  if (error) {
    const errorMessage =
      typeof error === "string"
        ? error
        : error?.message || "Something went wrong.";
    return <p className="text-red-500">{errorMessage}</p>;
  }

  if (!algorithm)
    return <p className="text-center mt-10">No algorithm found.</p>;

  const currentCode = algorithm.codes?.[selectedLangIndex];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Forward"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {algorithm.title}
      </h1>

      {/* Intuition */}
      {algorithm.intuition && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Intuition
          </h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            {algorithm.intuition}
          </p>
        </div>
      )}

      {/* Explanation */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Explanation
        </h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          {algorithm.explanation}
        </p>
      </div>

      {/* Complexities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-md font-bold text-gray-800 dark:text-white">
            TIME COMPLEXITY
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {algorithm.complexity?.time
              ? algorithm.complexity.time.toUpperCase()
              : "N/A"}
          </p>
        </div>
        <div>
          <h3 className="text-md font-bold text-gray-800 dark:text-white">
            SPACE COMPLEXITY
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {algorithm.complexity?.space
              ? algorithm.complexity.space.toUpperCase()
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Category & Difficulty */}
      <div className="flex flex-wrap gap-6">
        <p>
          <strong className="text-gray-800 dark:text-white">Category:</strong>{" "}
          {Array.isArray(algorithm.category)
            ? algorithm.category.join(", ")
            : "N/A"}
        </p>
        <p>
          <strong className="text-gray-800 dark:text-white">Difficulty:</strong>{" "}
          {algorithm.difficulty || "N/A"}
        </p>
      </div>

      {/* Code Examples */}
      {algorithm.codes?.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Code Example
            </h2>
            <div className="flex gap-2 items-center">
              <select
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded px-2 py-1"
                value={selectedLangIndex}
                onChange={(e) => setSelectedLangIndex(e.target.value)}
              >
                {algorithm.codes.map((code, index) => (
                  <option key={index} value={index}>
                    {code.language}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCopy}
                className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <SyntaxHighlighter
            language={currentCode.language?.toLowerCase()}
            style={materialDark}
            wrapLongLines
          >
            {currentCode.code}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Useful Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Useful Links
        </h2>
        {algorithm.links?.length > 0 ? (
          <ul className="list-disc pl-6 text-blue-600 dark:text-blue-400">
            {algorithm.links.map((link, index) => (
              <li key={index} className="mt-1">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            No links available.
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Tags
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {algorithm.tags?.length > 0 ? (
            algorithm.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full text-sm"
              >
                {tag}
              </span>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              No tags available.
            </p>
          )}
        </div>
      </div>

      {/* Voting & Contribute Actions */}
      <div className="flex justify-center gap-6 mt-10">
        {/* Upvote */}
        <button
          onClick={() => handleVote("upvote")}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 shadow-md transition"
        >
          <ThumbsUp
            size={20}
            className={`transition-all ${
              currentUserVoteType === "upvote" ? "fill-green-600" : ""
            }`}
          />
          <span>{algorithm?.upvotes || 0}</span>
        </button>

        {/* Downvote */}
        <button
          onClick={() => handleVote("downvote")}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 shadow-md transition"
        >
          <ThumbsDown
            size={20}
            className={`transition-all ${
              currentUserVoteType === "downvote" ? "fill-red-600" : ""
            }`}
          />
          <span>{algorithm?.downvotes || 0}</span>
        </button>

        {/* Contribute */}
        <button
          onClick={() => console.log("Open contribute modal or route")}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 shadow-md transition"
        >
          <Sparkles size={20} />
          <span>Contribute</span>
        </button>
      </div>
    </div>
  );
};

export default AlgorithmDetail;
