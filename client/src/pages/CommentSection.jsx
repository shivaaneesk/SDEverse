import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createComment,
  fetchCommentsByParent,
  replyToComment,
  removeComment,
} from "../features/comment/commentSlice";
import { Send, Trash2 } from "lucide-react";

const CommentSection = ({ parentType, parentId }) => {
  const dispatch = useDispatch();
  const { comments, loading } = useSelector((state) => state.comment);
  const [text, setText] = useState("");

  useEffect(() => {
    dispatch(fetchCommentsByParent({ parentType, parentId }));
  }, [dispatch, parentType, parentId]);

  const handleSubmit = () => {
    if (text.trim()) {
      dispatch(createComment({ parentType, parentId, text }));
      setText("");
    }
  };

  const handleReply = (commentId, replyText) => {
    if (replyText.trim()) {
      dispatch(replyToComment({ commentId, replyData: { text: replyText } }));
    }
  };

  const handleDelete = (id) => dispatch(removeComment(id));

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-lg space-y-6 border dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Discussion
      </h2>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Leave a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleSubmit}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
          title="Post comment"
        >
          <Send size={18} />
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">Loading comments...</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {comment.user?.name}
                </span>
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="text-red-500 hover:text-red-600"
                  title="Delete comment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {comment.text}
              </p>

              <div className="mt-4 space-y-2 pl-4 border-l-2 border-blue-500">
                {comment.replies?.map((reply) => (
                  <div
                    key={reply._id}
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="font-medium text-gray-800 dark:text-white">
                      {reply.user?.name}:
                    </span>{" "}
                    {reply.text}
                  </div>
                ))}

                <ReplyInput
                  onReply={(text) => handleReply(comment._id, text)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReplyInput = ({ onReply }) => {
  const [reply, setReply] = useState("");
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Reply..."
        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
      />
      <button
        onClick={() => {
          onReply(reply);
          setReply("");
        }}
        className="text-sm text-blue-600 hover:underline"
      >
        Reply
      </button>
    </div>
  );
};

export default CommentSection;
