import api from "../../utils/api";

// Add a new contribution
export const addContribution = async (data, token) => {
  const response = await api.post("/contributions", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get contributions by algorithm
export const getContributionsByAlgorithm = async (algorithmId) => {
  const response = await api.get(`/contributions/${algorithmId}`);
  return response.data;
};

// Vote on a contribution
export const voteContribution = async (id, voteType, token) => {
  const response = await api.post(
    `/contributions/${id}/vote`,
    { voteType },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Delete a contribution
export const deleteContribution = async (id, token) => {
  const response = await api.delete(`/contributions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
