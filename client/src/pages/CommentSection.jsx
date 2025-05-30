import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createComment,
  fetchCommentsByParent,
  replyToComment,
  removeComment,
} from "../features/comment/commentSlice";
import { Send, Trash2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

const MarkdownRenderer = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath]}
    rehypePlugins={[rehypeKatex]}
    components={{
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }}
  >
    {children}
  </ReactMarkdown>
);

const ReplyInput = ({ onReply }) => {
  const [reply, setReply] = useState("");
  const handleReplySubmit = () => {
    if (reply.trim()) {
      onReply(reply.trim());
      setReply("");
    }
  };
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
        onClick={handleReplySubmit}
        disabled={!reply.trim()}
        className={`text-sm transition ${
          reply.trim()
            ? "text-blue-600 hover:underline cursor-pointer"
            : "text-gray-400 cursor-not-allowed"
        }`}
      >
        Reply
      </button>
    </div>
  );
};

const CommentSection = ({ parentType, parentId, parentSlug }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetCommentId = queryParams.get("commentId");

  const { comments, loading } = useSelector((state) => state.comment);
  const currentUser = useSelector((state) => state.auth.user);
  const [text, setText] = useState("");
  const commentRefs = useRef({});

  useEffect(() => {
    dispatch(fetchCommentsByParent({ parentType, parentId }));
  }, [dispatch, parentType, parentId]);

  useEffect(() => {
    if (targetCommentId && commentRefs.current[targetCommentId]) {
      const el = commentRefs.current[targetCommentId];
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add(
        "ring-2",
        "ring-blue-500",
        "bg-blue-50",
        "dark:bg-gray-800"
      );

      setTimeout(() => {
        el.classList.remove(
          "ring-2",
          "ring-blue-500",
          "bg-blue-50",
          "dark:bg-gray-800"
        );
      }, 2500);
    }
  }, [comments, targetCommentId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await dispatch(createComment({ parentType, parentId, parentSlug, text }));
    await dispatch(fetchCommentsByParent({ parentType, parentId }));
    setText("");
  };

  const handleReply = async (commentId, replyText) => {
    await dispatch(
      replyToComment({ commentId, replyData: { text: replyText } })
    );
    await dispatch(fetchCommentsByParent({ parentType, parentId }));
  };

  const handleDelete = async (id) => {
    await dispatch(removeComment(id));
    await dispatch(fetchCommentsByParent({ parentType, parentId }));
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto mt-12 px-6 md:px-12">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
        Discussion
      </h2>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Leave a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`px-4 py-2 rounded-lg text-white transition ${
            text.trim()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          <Send size={18} />
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment._id}
              ref={(el) => (commentRefs.current[comment._id] = el)}
              className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300"
              id={`comment-${comment._id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${comment.user.username}`}>
                    <img
                      src={comment.user.avatarUrl || "/default-avatar.png"}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </Link>
                  <Link
                    to={`/profile/${comment.user.username}`}
                    className="text-sm font-semibold text-gray-800 dark:text-white hover:underline"
                  >
                    {comment.user.username}
                  </Link>
                </div>
                {currentUser?._id === comment.user._id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-red-500 hover:text-red-600"
                    title="Delete comment"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="mt-2 prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer>{comment.text}</MarkdownRenderer>
              </div>

              <div className="mt-4 space-y-4 pl-4 border-l-2 border-blue-500">
                {comment.replies?.map((reply) => (
                  <div key={reply._id} className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Link to={`/profile/${reply.user.username}`}>
                        <img
                          src={reply.user.avatarUrl || "/default-avatar.png"}
                          alt={reply.user.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      </Link>
                      <Link
                        to={`/profile/${reply.user.username}`}
                        className="font-medium text-gray-800 dark:text-white hover:underline"
                      >
                        {reply.user.username}
                      </Link>
                      {currentUser?._id === reply.user._id && (
                        <button
                          onClick={() => handleDelete(reply._id)}
                          className="ml-auto text-xs text-red-500 hover:text-red-600"
                          title="Delete reply"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="ml-8 prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer>{reply.text}</MarkdownRenderer>
                    </div>
                  </div>
                ))}
                <ReplyInput
                  onReply={(replyText) => handleReply(comment._id, replyText)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;