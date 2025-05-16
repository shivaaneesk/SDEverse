import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useDispatch } from "react-redux";
import { voteOnAlgorithm } from "../../features/algorithm/algorithmSlice";

const VotingSection = ({ algorithm, user }) => {
  const dispatch = useDispatch();

  const handleVote = (type) => {
    if (!user) return alert("You must be logged in to vote.");
    if (!algorithm?.slug) return;

    dispatch(
      voteOnAlgorithm({
        slug: algorithm.slug,
        voteData: { type },
      })
    );
  };

  const currentUserVoteType = (() => {
    if (!user || !algorithm) return null;
    if (algorithm.upvotedBy?.includes(user._id)) return "upvote";
    if (algorithm.downvotedBy?.includes(user._id)) return "downvote";
    return null;
  })();

  return (
    <div className="flex justify-center gap-6 mt-10">
      <button
        onClick={() => handleVote("upvote")}
        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 shadow-md transition"
      >
        <ThumbsUp
          size={20}
          className={currentUserVoteType === "upvote" ? "fill-green-600" : ""}
        />
        <span>{algorithm.upvotes || 0}</span>
      </button>
      <button
        onClick={() => handleVote("downvote")}
        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 shadow-md transition"
      >
        <ThumbsDown
          size={20}
          className={currentUserVoteType === "downvote" ? "fill-red-600" : ""}
        />
        <span>{algorithm.downvotes || 0}</span>
      </button>
    </div>
  );
};

export default VotingSection;
