import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addContribution,
  getContributionsByAlgorithm,
  voteContribution,
  deleteContribution,
} from "./contributionAPI";

const initialState = {
  contributions: [],
  loading: false,
  error: null,
};

// Create a new contribution
export const createContribution = createAsyncThunk(
  "contribution/createContribution",
  async (contributionData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      return await addContribution(contributionData, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating contribution");
    }
  }
);

// Fetch contributions by algorithm ID
export const fetchContributionsByAlgorithm = createAsyncThunk(
  "contribution/fetchContributionsByAlgorithm",
  async (algorithmId, { rejectWithValue }) => {
    try {
      return await getContributionsByAlgorithm(algorithmId);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching contributions");
    }
  }
);

// Vote on a contribution
export const voteContributionAction = createAsyncThunk(
  "contribution/voteContribution",
  async ({ id, voteType }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      return await voteContribution(id, voteType, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error voting on contribution");
    }
  }
);

// Delete a contribution
export const removeContribution = createAsyncThunk(
  "contribution/removeContribution",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      return await deleteContribution(id, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting contribution");
    }
  }
);

// Contribution slice
const contributionSlice = createSlice({
  name: "contribution",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContributionsByAlgorithm.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContributionsByAlgorithm.fulfilled, (state, action) => {
        state.loading = false;
        state.contributions = action.payload;
      })
      .addCase(fetchContributionsByAlgorithm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createContribution.pending, (state) => {
        state.loading = true;
      })
      .addCase(createContribution.fulfilled, (state, action) => {
        state.loading = false;
        state.contributions.unshift(action.payload);
      })
      .addCase(createContribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(voteContributionAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(voteContributionAction.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.contributions.findIndex(c => c._id === updated._id);
        if (index !== -1) {
          state.contributions[index] = updated;
        }
      })
      .addCase(voteContributionAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeContribution.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeContribution.fulfilled, (state, action) => {
        state.loading = false;
        state.contributions = state.contributions.filter(c => c._id !== action.payload._id);
      })
      .addCase(removeContribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default contributionSlice.reducer;
