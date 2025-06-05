import api from "../../utils/api";

export const createDataStructureProposal = async (proposalData) => {
  const res = await api.post("/data-structure-proposals/newproposal", proposalData);
  return res.data;
};

export const getAllDataStructureProposals = async (query = {}) => {
  const res = await api.get("/data-structure-proposals", {
    params: query,
  });
  return res.data;
};

export const getDataStructureProposalBySlug = async (slug) => {
  const res = await api.get(`/data-structure-proposals/slug/${slug}`);
  return res.data;
};

export const updateDataStructureProposal = async (slug, proposalData) => {
  const res = await api.patch(`/data-structure-proposals/${slug}`, proposalData);
  return res.data;
};

export const reviewDataStructureProposal = async (slug, reviewData) => {
  const res = await api.put(`/data-structure-proposals/review/${slug}`, reviewData);
  return res.data;
};

export const deleteDataStructureProposal = async (slug) => {
  const res = await api.delete(`/data-structure-proposals/${slug}`);
  return res.data;
};
