import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createProposal,
  getAllProposals,
  getProposalBySlug,
  updateProposal,
  reviewProposal,
  deleteProposal,
} from "./dataStructureProposalAPI";

const initialState = {
  proposals: [],
  currentProposal: null,
  loading: false,
  error: null,
  total: 0,
  pages: 1,
  currentPage: 1,
};

export const submitNewProposal = createAsyncThunk(
  "dataStructureProposal/submitNew",
  async (proposalData, { rejectWithValue }) => {
    try {
      return await createProposal(proposalData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error creating proposal"
      );
    }
  }
);

export const fetchProposals = createAsyncThunk(
  "dataStructureProposal/fetchAll",
  async (query = {}, { rejectWithValue }) => {
    try {
      const data = await getAllProposals(query);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch proposals"
      );
    }
  }
);

export const fetchProposalDetails = createAsyncThunk(
  "dataStructureProposal/fetchDetails",
  async (slug, { rejectWithValue }) => {
    try {
      return await getProposalBySlug(slug);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching proposal details"
      );
    }
  }
);

export const saveUpdatedProposal = createAsyncThunk(
  "dataStructureProposal/saveUpdated",
  async ({ slug, proposalData }, { rejectWithValue }) => {
    try {
      return await updateProposal(slug, proposalData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error updating proposal"
      );
    }
  }
);

export const reviewExistingProposal = createAsyncThunk(
  "dataStructureProposal/review",
  async ({ slug, reviewData }, { rejectWithValue }) => {
    try {
      return await reviewProposal(slug, reviewData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error reviewing proposal"
      );
    }
  }
);

export const removeProposal = createAsyncThunk(
  "dataStructureProposal/remove",
  async (slug, { rejectWithValue }) => {
    try {
      await deleteProposal(slug);
      return slug;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error deleting proposal"
      );
    }
  }
);

const dataStructureProposalSlice = createSlice({
  name: "dataStructureProposal",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },

    clearCurrentProposal(state) {
      state.currentProposal = null;
    },

    updateProposalInState: (state, action) => {
      const updatedProposal = action.payload;

      const index = state.proposals.findIndex(
        (p) => p.slug === updatedProposal.slug
      );
      if (index !== -1) {
        state.proposals[index] = updatedProposal;
      }

      if (state.currentProposal?.slug === updatedProposal.slug) {
        state.currentProposal = updatedProposal;
      }
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
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

      .addCase(fetchProposalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProposalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProposal = action.payload;
      })
      .addCase(fetchProposalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(submitNewProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitNewProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals.unshift(action.payload);
        state.total++;
      })
      .addCase(submitNewProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(saveUpdatedProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUpdatedProposal.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProposal = action.payload;

        const index = state.proposals.findIndex(
          (p) => p.slug === updatedProposal.slug
        );
        if (index !== -1) {
          state.proposals[index] = updatedProposal;
        }

        if (state.currentProposal?.slug === updatedProposal.slug) {
          state.currentProposal = updatedProposal;
        }
      })
      .addCase(saveUpdatedProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(reviewExistingProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reviewExistingProposal.fulfilled, (state, action) => {
        state.loading = false;
        const reviewedProposal = action.payload;

        const index = state.proposals.findIndex(
          (p) => p.slug === reviewedProposal.slug
        );
        if (index !== -1) {
          state.proposals[index] = reviewedProposal;
        }

        if (state.currentProposal?.slug === reviewedProposal.slug) {
          state.currentProposal = reviewedProposal;
        }
      })
      .addCase(reviewExistingProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProposal.fulfilled, (state, action) => {
        state.loading = false;

        state.proposals = state.proposals.filter(
          (p) => p.slug !== action.payload
        );
        state.total--;
        if (state.currentProposal?.slug === action.payload) {
          state.currentProposal = null;
        }
      })
      .addCase(removeProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentProposal, updateProposalInState } =
  dataStructureProposalSlice.actions;

export default dataStructureProposalSlice.reducer;
