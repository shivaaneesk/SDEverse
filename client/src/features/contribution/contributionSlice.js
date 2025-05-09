import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addContribution,
  getContributionsByAlgorithm,
  upvoteContribution,
  downvoteContribution,
  deleteContribution,
} from "./contributionAPI";

const initialState = {
  contributions: [],
  loading: false,
  error: null,
};

export const createContribution = createAsyncThunk(
  "contribution/createContribution",
  async (contributionData, { rejectWithValue }) => {
    try {
      const response = await addContribution(contributionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchContributionsByAlgorithm = createAsyncThunk(
  "contribution/fetchContributionsByAlgorithm",
  async (algorithmId, { rejectWithValue }) => {
    try {
      const response = await getContributionsByAlgorithm(algorithmId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const upvoteContributionAction = createAsyncThunk(
  "contribution/upvoteContribution",
  async (id, { rejectWithValue }) => {
    try {
      const response = await upvoteContribution(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const downvoteContributionAction = createAsyncThunk(
  "contribution/downvoteContribution",
  async (id, { rejectWithValue }) => {
    try {
      const response = await downvoteContribution(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeContribution = createAsyncThunk(
  "contribution/removeContribution",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteContribution(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const contributionSlice = createSlice({
  name: "contribution",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchContributionsByAlgorithm.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      fetchContributionsByAlgorithm.fulfilled,
      (state, action) => {
        state.loading = false;
        state.contributions = action.payload;
      }
    );
    builder.addCase(fetchContributionsByAlgorithm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Error fetching contributions";
    });

    builder.addCase(createContribution.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createContribution.fulfilled, (state, action) => {
      state.loading = false;
      state.contributions.unshift(action.payload);
    });
    builder.addCase(createContribution.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Error creating contribution";
    });

    builder.addCase(upvoteContributionAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(upvoteContributionAction.fulfilled, (state, action) => {
      state.loading = false;
      const updatedContribution = state.contributions.find(
        (contrib) => contrib._id === action.payload._id
      );
      if (updatedContribution) {
        updatedContribution.upvotes = action.payload.upvotes;
        updatedContribution.downvotes = action.payload.downvotes;
      }
    });
    builder.addCase(upvoteContributionAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Error upvoting contribution";
    });

    builder.addCase(downvoteContributionAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(downvoteContributionAction.fulfilled, (state, action) => {
      state.loading = false;
      const updatedContribution = state.contributions.find(
        (contrib) => contrib._id === action.payload._id
      );
      if (updatedContribution) {
        updatedContribution.upvotes = action.payload.upvotes;
        updatedContribution.downvotes = action.payload.downvotes;
      }
    });
    builder.addCase(downvoteContributionAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Error downvoting contribution";
    });

    builder.addCase(removeContribution.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(removeContribution.fulfilled, (state, action) => {
      state.loading = false;
      state.contributions = state.contributions.filter(
        (contrib) => contrib._id !== action.payload._id
      );
    });
    builder.addCase(removeContribution.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Error deleting contribution";
    });
  },
});

export default contributionSlice.reducer;
