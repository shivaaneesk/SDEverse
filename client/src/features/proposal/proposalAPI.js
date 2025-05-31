import api from "../../utils/api";

// Set auth header if needed
const config = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Create proposal
export const createProposal = async ( proposalData, token) => {
  const response = await api.post(`proposal/newproposal`, proposalData, config(token));
  return response.data;
};

// Get all proposals (admin or user)
export const getAllProposals = async (query, token) => {
  const queryString = new URLSearchParams(query).toString();
  const response = await api.get(`proposal?${queryString}`, config(token));
  return response.data;
};

// Get proposal by slug (public)
export const getProposalBySlug = async (slug) => {
  const response = await api.get(`proposal/slug/${slug}`);
  return response.data;
};

// Update proposal
export const updateProposal = async (slug, proposalData, token) => {
  const response = await api.patch(`proposal/${slug}`, proposalData, config(token));
  return response.data;
};

// Review proposal (admin)
export const reviewProposal = async (slug, reviewData, token) => {
  const response = await api.put(`proposal/review/${slug}`, reviewData, config(token));
  return response.data;
};

// Delete proposal (admin)
export const deleteProposal = async (slug, token) => {
  const response = await api.delete(`proposal/${slug}`, config(token));
  return response.data;
};