import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDataStructureBySlug,
  voteOnDataStructure,
} from "../features/dataStructure/dataStructureSlice";
import Loader from "../components/Loader";
import DataStructurePreview from "./DataStructurePreview";
import CommentSection from "./CommentSection";
import {
  ArrowLeft,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const DataStructureDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { dataStructure, loading, error } = useSelector(
    (state) => state.dataStructure
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchDataStructureBySlug(slug));
    }
  }, [slug, dispatch]);

  const handleVote = (type) => {
    if (!user) {
      toast.info("You must be logged in to vote.");
      return;
    }

    if (!dataStructure?.slug) return;

    dispatch(
      voteOnDataStructure({
        slug: dataStructure.slug,
        voteData: { type },
      })
    );
  };

  const currentUserVoteType = (() => {
    if (!user || !dataStructure) return null;
    if (dataStructure.upvotedBy?.includes(user._id)) return "upvote";
    if (dataStructure.downvotedBy?.includes(user._id)) return "downvote";
    return null;
  })();

  const handleContribute = () => {
    if (!user) {
      toast.info("You must be logged in to contribute.");
      return;
    }

    navigate(`/data-structures/${dataStructure.slug}/contribute`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-md text-center max-w-lg w-full">
          <p className="text-xl font-semibold mb-3">Oops! An error occurred.</p>
          <p className="text-base mb-4">
            {error.message || "Failed to load data structure details."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );

  if (!dataStructure)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg shadow-md text-center max-w-lg w-full">
          <p className="text-xl font-semibold mb-3">No data structure found.</p>
          <p className="text-base mb-4">
            The requested data structure could not be found or may have been
            removed.
          </p>
          <button
            onClick={() => navigate("/data-structures")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md"
          >
            Browse Data Structures
          </button>
        </div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center h-14">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all text-sm"
            title="Go Back"
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg sm:text-xl font-semibold truncate max-w-[calc(100%-160px)] text-center">
            {dataStructure.title}
          </h1>
          <button
            onClick={() => navigate(1)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all text-sm"
            title="Go Forward"
            aria-label="Go forward to next page"
          >
            <span className="hidden sm:inline">Forward</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area - Single Column */}
      <main className="flex-1 overflow-y-auto custom-scrollbar container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Data Structure Preview */}
        <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {/* NEW: Pass dataStructure prop to the new DataStructurePreview */}
          <DataStructurePreview dataStructure={dataStructure} />
        </section>

        {/* Voting and Contribute Buttons - Straight-through, compact */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Voting Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleVote("upvote")}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-900 text-green-700 dark:text-green-300 shadow-md transition-all duration-200 transform hover:scale-105"
              aria-label="Upvote data structure"
            >
              <ThumbsUp
                size={20}
                className={
                  currentUserVoteType === "upvote" ? "fill-current" : ""
                }
              />
              <span className="font-semibold text-base">
                {dataStructure.upvotes || 0}
              </span>
            </button>
            <button
              onClick={() => handleVote("downvote")}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-700 dark:text-red-300 shadow-md transition-all duration-200 transform hover:scale-105"
              aria-label="Downvote data structure"
            >
              <ThumbsDown
                size={20}
                className={
                  currentUserVoteType === "downvote" ? "fill-current" : ""
                }
              />
              <span className="font-semibold text-base">
                {dataStructure.downvotes || 0}
              </span>
            </button>
          </div>

          {/* Contribute Button */}
          <div className="flex justify-center mt-4 sm:mt-0">
            <button
              onClick={handleContribute}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 text-white font-medium shadow-lg transition-all duration-300 transform hover:scale-105"
              aria-label="Contribute to this data structure"
            >
              <Sparkles size={20} />
              <span>Contribute</span>
            </button>
          </div>
        </section>

        {/* Comment Section */}
        <section>
          <CommentSection
            parentType="DataStructure"
            parentId={dataStructure._id}
            parentSlug={dataStructure.slug}
          />
        </section>
      </main>
    </motion.div>
  );
};

export default DataStructureDetail;
