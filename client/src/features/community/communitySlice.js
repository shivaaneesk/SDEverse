import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getTopContributors,
  getTopFeedback,
} from "./communityAPI";
// Async thunks
export const fetchTopContributors = createAsyncThunk(
  'community/fetchTopContributors',
  async (_, { rejectWithValue }) => {
    try {
      return await getTopContributors();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTopFeedback = createAsyncThunk(
  'community/fetchTopFeedback',
  async (_, { rejectWithValue }) => {
    try {
      return await getTopFeedback();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  topContributors: [],
  topFeedback: [],
  loading: false,
  error: null,
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    resetCommunity: (state) => {
      state.topContributors = [];
      state.topFeedback = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Top Contributors
      .addCase(fetchTopContributors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopContributors.fulfilled, (state, action) => {
        state.loading = false;
        state.topContributors = action.payload;
      })
      .addCase(fetchTopContributors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Top Feedback
      .addCase(fetchTopFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.topFeedback = action.payload;
      })
      .addCase(fetchTopFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCommunity } = communitySlice.actions;
export default communitySlice.reducer;