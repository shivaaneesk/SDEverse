import api from "../../utils/api";

// Create a new algorithm
export const createAlgorithm = async (data, token) => {
  try {
    const response = await api.post("/algorithms", data, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating algorithm:", error);
    throw error;
  }
};

// Fetch all algorithms with optional filters
export const getAllAlgorithms = async (params, token) => {
  try {
    const response = await api.get("/algorithms", {
      params,
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching algorithms:", error);
    throw error;
  }
};

// Get algorithm by slug
export const getAlgorithmBySlug = async (slug, token) => {
  try {
    const response = await api.get(`/algorithms/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching algorithm by slug:", error);
    throw error;
  }
};

// Update an algorithm
export const updateAlgorithm = async (slug, data, token) => {
  try {
    const response = await api.put(`/algorithms/${slug}`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating algorithm:", error);
    throw error;
  }
};

// Delete an algorithm
export const deleteAlgorithm = async (slug, token) => {
  try {
    const response = await api.delete(`/algorithms/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting algorithm:", error);
    throw error;
  }
};

// Vote on an algorithm
export const voteAlgorithm = async (slug, voteData, token) => {
  const { voteType, userId } = voteData;

  if (!voteType || !userId) {
    throw new Error("Missing voteType or userId");
  }

  try {
    const response = await api.post(
      `/algorithms/${slug}/vote`,
      { type: voteType, userId },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error voting on algorithm:", error);
    throw error;
  }
};

// Fetch categories
export const getCategories = async () => {
  try {
    const response = await api.get("/algorithms/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Search algorithms with filters
export const searchAlgorithms = async (params, token) => {
  try {
    const response = await api.get("/algorithms/search", {
      params,
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching algorithms:", error);
    throw error;
  }
};
