import api from '../../utils/api';

export const getNote = async (algorithmId) => {
  const res = await api.get(`/notes/${algorithmId}`);
  return res.data;
};

export const setNote = async (noteData) => {
  const res = await api.post('/notes', noteData);
  return res.data;
};

export const deleteNote = async (algorithmId) => {
  const res = await api.delete(`/notes/${algorithmId}`);
  return res.data;
};

export const getAllMyNotes = async ({ page = 1, limit = 9 }) => {
  const res = await api.get(`/notes/my`, { params: { page, limit } });
  return res.data;
};