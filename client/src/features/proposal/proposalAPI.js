import api from "../../utils/api";

// Create proposal
export const createProposal = async (proposalData) => {
  const response = await api.post(`proposal/newproposal`, proposalData);
  return response.data;
};

// Get all proposals (admin or user)
export const getAllProposals = async (query) => {
  const response = await api.get(`proposal`, {
    params: query,
  });
  return response.data;
};

// Get proposal by slug (public)
export const getProposalBySlug = async (slug) => {
  const response = await api.get(`proposal/slug/${slug}`);
  return response.data;
};

// Update proposal
export const updateProposal = async (slug, proposalData) => {
  const response = await api.patch(`proposal/${slug}`, proposalData);
  return response.data;
};

// Review proposal (admin)
export const reviewProposal = async (slug, reviewData) => {
  const response = await api.put(`proposal/review/${slug}`, reviewData);
  return response.data;
};

// Delete proposal (admin)
export const deleteProposal = async (slug) => {
  const response = await api.delete(`proposal/${slug}`);
  return response.data;
};