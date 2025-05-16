import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createProposal,
  getAllProposals,
  getProposalBySlug,
  updateProposal,
  reviewProposal,
  deleteProposal,
} from "./proposalAPI";

const initialState = {
  proposals: [],
  currentProposal: null,
  loading: false,
  error: null,
  total: 0,
  pages: 1,
  currentPage: 1,
};

// Thunks with clear naming

export const submitNewProposal = createAsyncThunk(
  "proposal/submitNewProposal",
  async (proposalData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      return await createProposal(proposalData, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating proposal");
    }
  }
);


export const fetchProposals = createAsyncThunk(
  "proposal/fetchProposals",
  async (query, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      return await getAllProposals(query, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching proposals");
    }
  }
);

export const fetchProposalDetails = createAsyncThunk(
  "proposal/fetchProposalDetails",
  async (slug, { rejectWithValue }) => {
    try {
      return await getProposalBySlug(slug);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching proposal");
    }
  }
);

export const saveUpdatedProposal = createAsyncThunk(
  "proposal/saveUpdatedProposal",
  async ({ slug, proposalData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      return await updateProposal(slug, proposalData, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error updating proposal");
    }
  }
);

export const reviewExistingProposal = createAsyncThunk(
  "proposal/reviewExistingProposal",
  async ({ slug, reviewData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      return await reviewProposal(slug, reviewData, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error reviewing proposal");
    }
  }
);

export const removeProposal = createAsyncThunk(
  "proposal/removeProposal",
  async (slug, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      return await deleteProposal(slug, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting proposal");
    }
  }
);

// Slice

const proposalSlice = createSlice({
  name: "proposal",
  initialState,
  reducers: {
    clearProposalError(state) {
      state.error = null;
    },
    clearCurrentProposal(state) {
      state.currentProposal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProposals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload.proposals;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by slug
      .addCase(fetchProposalDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProposalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProposal = action.payload;
      })
      .addCase(fetchProposalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(submitNewProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitNewProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals.unshift(action.payload);
      })
      .addCase(submitNewProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(saveUpdatedProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveUpdatedProposal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.proposals.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.proposals[index] = action.payload;
        }
        if (state.currentProposal?.slug === action.payload.slug) {
          state.currentProposal = action.payload;
        }
      })
      .addCase(saveUpdatedProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Review
      .addCase(reviewExistingProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(reviewExistingProposal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.proposals.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.proposals[index] = action.payload;
        }
      })
      .addCase(reviewExistingProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(removeProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = state.proposals.filter(p => p.slug !== action.meta.arg);
      })
      .addCase(removeProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Exports
export const { clearProposalError, clearCurrentProposal } = proposalSlice.actions;
export default proposalSlice.reducer;
