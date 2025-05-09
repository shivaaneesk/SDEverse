import api from "../../utils/api";

export const fetchAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const fetchUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const deleteUserById = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data;
};
