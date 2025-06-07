import api from "../../utils/api";

export const createProposal = async (proposalData) => {
  const res = await api.post("/data-structure-proposals/newproposal", proposalData);
  return res.data;
};

export const getAllProposals = async (query = {}) => {
  const res = await api.get("/data-structure-proposals", {
    params: query,
  });
  return res.data;
};

export const getProposalBySlug = async (slug) => {
  const res = await api.get(`/data-structure-proposals/slug/${slug}`);
  return res.data;
};

export const updateProposal = async (slug, proposalData) => {
  const res = await api.patch(`/data-structure-proposals/${slug}`, proposalData);
  return res.data;
};

export const reviewProposal = async (slug, reviewData) => {
  const res = await api.put(`/data-structure-proposals/review/${slug}`, reviewData);
  return res.data;
};

export const deleteProposal = async (slug) => {
  const res = await api.delete(`/data-structure-proposals/${slug}`);
  return res.data;
};