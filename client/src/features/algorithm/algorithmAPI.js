import api from "../../utils/api";

const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createAlgorithm = async (data, token) => {
  const res = await api.post("/algorithms", data, withAuth(token));
  return res.data;
};

export const getAllAlgorithms = async (params, token) => {
  const res = await api.get("/algorithms", {
    params,
    ...(token ? withAuth(token) : {}),
  });
  return {
    algorithms: res.data.algorithms,
    total: res.data.total,
    pages: res.data.pages,
    currentPage: res.data.currentPage,
  };
};

export const getAlgorithmBySlug = async (slug, token) => {
  const res = await api.get(`/algorithms/${slug}`, withAuth(token));
  return res.data;
};

export const updateAlgorithm = async (slug, data, token) => {
  const res = await api.put(`/algorithms/${slug}`, data, withAuth(token));
  return res.data;
};

export const deleteAlgorithm = async (slug, token) => {
  const res = await api.delete(`/algorithms/${slug}`, withAuth(token));
  return res.data;
};

export const voteAlgorithm = async (slug, voteData, token) => {
  const res = await api.post(
    `/algorithms/${slug}/vote`,
    voteData,
    withAuth(token)
  );
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get("/algorithms/categories");
  return res.data;
};

export const searchAlgorithms = async (params, token) => {
  const res = await api.get("/algorithms/search", {
    params,
    ...(token ? withAuth(token) : {}),
  });
  return {
    algorithms: res.data.results,
    total: res.data.total,
    pages: res.data.pages,
    currentPage: res.data.currentPage,
  };
};
