import api from "../../utils/api";

export const fetchAllUsers = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();

  const response = await api.get(`/users?${queryString}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchUserById = async (id, token) => {
  const response = await api.get(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteUserById = async (id, token) => {
  const response = await api.delete(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUserRole = async (id, role, token) => {
  const response = await api.put(
    `/users/${id}/role`,
    { role },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const fetchMyProfile = async (token) => {
  const response = await api.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateMyProfile = async (profileData, token) => {
  const response = await api.patch("/users/me", profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateCompetitiveStats = async (token) => {
  const response = await api.get("/users/update-competitive-stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  return {
    competitiveStats: response.data.competitiveStats,
    extraStats: response.data.extraStats
  };
};

export const updateSocialProfiles = async (token) => {
  const response = await api.get("/users/update-social-stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  return {
    socialStats: response.data.socialStats
  };
};

export const updateSingleCompetitiveStat = async (platform, token) => {
  const response = await api.get(`/users/update-competitive-stats/${platform}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    ...response.data,
    platform // Ensure platform is included
  };
};

export const updateSingleSocialStat = async (platform, token) => {
  const response = await api.get(`/users/update-social-stats/${platform}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    ...response.data,
    platform // Ensure platform is included
  };
};

export const fetchAdminAnalytics = async (token) => {
  const response = await api.get("/users/analytics", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};