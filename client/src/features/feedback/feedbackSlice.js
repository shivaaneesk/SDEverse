import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitFeedback, fetchAllFeedback } from "./feedbackAPI";

const initialState = {
  feedbackList: [],
  loading: false,
  error: null,
  success: false,
};

export const sendFeedback = createAsyncThunk(
  "feedback/sendFeedback",
  async (payload, { rejectWithValue }) => {
    try {
      return await submitFeedback(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getFeedbackList = createAsyncThunk(
  "feedback/getFeedbackList",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllFeedback();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearFeedbackStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendFeedback.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(sendFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getFeedbackList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFeedbackList.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbackList = action.payload;
      })
      .addCase(getFeedbackList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFeedbackStatus } = feedbackSlice.actions;
export default feedbackSlice.reducer;
