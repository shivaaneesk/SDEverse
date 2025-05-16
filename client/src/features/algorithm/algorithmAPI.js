import api from "../../utils/api";

// Helper to attach Authorization header automatically
const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createAlgorithm = async (data, token) => {
  try {
    const response = await api.post("/algorithms", data, withAuth(token));
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const getAllAlgorithms = async (params, token) => {
  try {
    const response = await api.get("/algorithms", {
      params,
      ...(token ? withAuth(token) : {}),
    });
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const getAlgorithmBySlug = async (slug, token) => {
  try {
    const response = await api.get(`/algorithms/${slug}`, withAuth(token));
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const updateAlgorithm = async (slug, data, token) => {
  try {
    const response = await api.put(`/algorithms/${slug}`, data, withAuth(token));
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const deleteAlgorithm = async (slug, token) => {
  try {
    const response = await api.delete(`/algorithms/${slug}`, withAuth(token));
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const voteAlgorithm = async (slug, voteData, token) => {
  try {
    const response = await api.post(`/algorithms/${slug}/vote`, voteData, withAuth(token));
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get("/algorithms/categories");
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const searchAlgorithms = async (params, token) => {
  try {
    const response = await api.get("/algorithms/search", {
      params,
      ...(token ? withAuth(token) : {}),
    });
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};
