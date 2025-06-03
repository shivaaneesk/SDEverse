import api from "../../utils/api";

export const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return response.data;
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const sendBroadcastNotification = async (payload) => {
  try {
    const response = await api.post("/notifications/admin/broadcast", payload);
    return response.data;
  } catch (error) {
    console.error("Error sending broadcast notification:", error);
    throw error;
  }
};
