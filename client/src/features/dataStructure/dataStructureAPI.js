import api from "../../utils/api";

export const createDataStructure = async (data) => {
  const res = await api.post("/data-structures", data);
  return res.data;
};

export const getAllDataStructures = async (params = {}) => {
  const res = await api.get("/data-structures", { params });
  return {
    dataStructures: res.data.dataStructures,
    total: res.data.total,
    pages: res.data.pages,
    currentPage: res.data.currentPage,
  };
};

export const getAllDataStructuresForList = async (params = {}) => {
  const res = await api.get("/data-structures/list", { params });
  return {
    dataStructures: res.data.dataStructures,
    total: res.data.total,
  };
};

export const getDataStructureBySlug = async (slug) => {
  const res = await api.get(`/data-structures/${slug}`);
  return res.data;
};

export const updateDataStructure = async (slug, data) => {
  const res = await api.put(`/data-structures/${slug}`, data);
  return res.data;
};

export const deleteDataStructure = async (slug) => {
  const res = await api.delete(`/data-structures/${slug}`);
  return res.data;
};

export const voteDataStructure = async (slug, voteData) => {
  const res = await api.post(`/data-structures/${slug}/vote`, voteData);
  return res.data;
};

export const getDataStructureCategories = async () => {
  const res = await api.get("/data-structures/categories");
  return res.data;
};

export const searchDataStructures = async (params = {}) => {
  const res = await api.get("/data-structures/search", { params });
  return {
    dataStructures: res.data.results,
    total: res.data.total,
    pages: res.data.pages,
    currentPage: res.data.currentPage,
  };
};

export const addOperationImplementation = async (slug, implementationData) => {
  const res = await api.post(`/data-structures/${slug}/code`, implementationData);
  return res.data;
};

export const getDataStructureContributors = async (slug) => {
  const res = await api.get(`/data-structures/${slug}/contributors`);
  return res.data;
};