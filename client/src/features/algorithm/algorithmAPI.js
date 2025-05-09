import api from "../../utils/api";

export const createAlgorithm = async (data) => {
  try {
    const response = await api.post("/algorithms", data);
    return response.data;
  } catch (error) {
    console.error("Error creating algorithm:", error);
    throw error;
  }
};

export const getAllAlgorithms = async (params) => {
  try {
    const response = await api.get("/algorithms", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching algorithms:", error);
    throw error;
  }
};

export const getAlgorithmBySlug = async (slug) => {
  try {
    const response = await api.get(`/algorithms/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching algorithm by slug:", error);
    throw error;
  }
};

export const updateAlgorithm = async (slug, data) => {
  try {
    const response = await api.put(`/algorithms/${slug}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating algorithm:", error);
    throw error;
  }
};

export const deleteAlgorithm = async (slug) => {
  try {
    const response = await api.delete(`/algorithms/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting algorithm:", error);
    throw error;
  }
};

export const voteAlgorithm = async (slug, voteData, token) => {
  const { voteType, userId } = voteData;

  if (!voteType || !userId) {
    throw new Error("Missing voteType or userId");
  }

  const response = await api.post(
    `/algorithms/${slug}/vote`,
    { type: voteType, userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getCategories = async () => {
  try {
    const response = await api.get("/algorithms/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const searchAlgorithms = async (params) => {
  try {
    const response = await api.get("/algorithms/search", { params });
    return response.data;
  } catch (error) {
    console.error("Error searching algorithms:", error);
    throw error;
  }
};
