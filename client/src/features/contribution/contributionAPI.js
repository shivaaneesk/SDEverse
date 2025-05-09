import api from "../../utils/api";

export const addContribution = async (data) => {
  try {
    const response = await api.post("/contributions", data);
    return response.data;
  } catch (error) {
    console.error("Error adding contribution:", error);
    throw error;
  }
};

export const getContributionsByAlgorithm = async (algorithmId) => {
  try {
    const response = await api.get(`/contributions/${algorithmId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching contributions:", error);
    throw error;
  }
};

export const upvoteContribution = async (id) => {
  try {
    const response = await api.post(`/contributions/${id}/upvote`);
    return response.data;
  } catch (error) {
    console.error("Error upvoting contribution:", error);
    throw error;
  }
};

export const downvoteContribution = async (id) => {
  try {
    const response = await api.post(`/contributions/${id}/downvote`);
    return response.data;
  } catch (error) {
    console.error("Error downvoting contribution:", error);
    throw error;
  }
};

export const deleteContribution = async (id) => {
  try {
    const response = await api.delete(`/contributions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting contribution:", error);
    throw error;
  }
};
