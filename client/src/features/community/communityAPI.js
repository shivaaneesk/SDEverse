import api from "../../utils/api";

// Get top contributors
export const getTopContributors = async () => {
  try {
    const response = await api.get(`/community/top-contributors`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch top contributors');
  }
};

// Get top feedback providers
export const getTopFeedback = async () => {
  try {
    const response = await api.get(`/community/top-feedback`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch top feedback providers');
  }
};

