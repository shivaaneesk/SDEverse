import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  markNotificationAsRead,
  sendBroadcastNotification,
} from "./notificationAPI";

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  broadcastStatus: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      return await getNotifications();
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      return await markNotificationAsRead(id);
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const broadcastNotification = createAsyncThunk(
  "notifications/broadcastNotification",
  async (payload, { rejectWithValue }) => {
    try {
      return await sendBroadcastNotification(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    markReadLocally: (state, action) => {
      const index = state.notifications.findIndex(
        (n) => n._id === action.payload
      );
      if (index !== -1) {
        state.notifications[index].read = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n._id === action.payload._id
        );
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      })
      .addCase(broadcastNotification.pending, (state) => {
        state.broadcastStatus = "loading";
      })
      .addCase(broadcastNotification.fulfilled, (state, action) => {
        state.broadcastStatus = "success";
      })
      .addCase(broadcastNotification.rejected, (state, action) => {
        state.broadcastStatus = "error";
        state.error = action.payload;
      });
  },
});
export const { markReadLocally } = notificationSlice.actions;
export default notificationSlice.reducer;
