import api from "../../utils/api";

export const submitFeedback = async (payload) => {
  try {
    const response = await api.post("/feedback", payload);
    return response.data;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

export const fetchAllFeedback = async () => {
  try {
    const response = await api.get("/feedback/feedback"); // Optional: admin route
    return response.data;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw error;
  }
};
