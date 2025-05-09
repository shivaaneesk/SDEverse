import api from "../../utils/api";

export const addComment = async (data) => {
  try {
    const response = await api.post("/comments", data);
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const getCommentsByParent = async (parentType, parentId) => {
  try {
    const response = await api.get(`/comments/${parentType}/${parentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const addReplyToComment = async (commentId, data) => {
  try {
    const response = await api.post(`/comments/${commentId}/reply`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding reply:", error);
    throw error;
  }
};

export const deleteComment = async (id) => {
  try {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
