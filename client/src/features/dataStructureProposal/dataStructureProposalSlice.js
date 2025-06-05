import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createDataStructureProposal,
  getAllDataStructureProposals,
  getDataStructureProposalBySlug,
  updateDataStructureProposal,
  reviewDataStructureProposal,
  deleteDataStructureProposal,
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

const getToken = (getState) => getState().auth?.token;

export const submitNewDataStructureProposal = createAsyncThunk(
  "dataStructureProposal/submitNewProposal",
  async (proposalData, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      return await createDataStructureProposal(proposalData, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating proposal");
    }
  }
);

export const fetchDataStructureProposals = createAsyncThunk(
  "dataStructureProposal/fetchProposals",
  async (query, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      const data = await getAllDataStructureProposals(query, token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch proposals");
    }
  }
);

export const fetchDataStructureProposalDetails = createAsyncThunk(
  "dataStructureProposal/fetchProposalDetails",
  async (slug, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      return await getDataStructureProposalBySlug(slug, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching proposal");
    }
  }
);

export const saveUpdatedDataStructureProposal = createAsyncThunk(
  "dataStructureProposal/saveUpdatedProposal",
  async ({ slug, proposalData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      return await updateDataStructureProposal(slug, proposalData, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error updating proposal");
    }
  }
);

export const reviewExistingDataStructureProposal = createAsyncThunk(
  "dataStructureProposal/reviewExistingProposal",
  async ({ slug, reviewData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      return await reviewDataStructureProposal(slug, reviewData, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error reviewing proposal");
    }
  }
);

export const removeDataStructureProposal = createAsyncThunk(
  "dataStructureProposal/removeProposal",
  async (slug, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      return await deleteDataStructureProposal(slug, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting proposal");
    }
  }
);

const dataStructureProposalSlice = createSlice({
  name: "dataStructureProposal",
  initialState,
  reducers: {
    clearDataStructureProposalError(state) {
      state.error = null;
    },
    clearCurrentDataStructureProposal(state) {
      state.currentProposal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataStructureProposals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDataStructureProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload.proposals;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchDataStructureProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDataStructureProposalDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDataStructureProposalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProposal = action.payload;
      })
      .addCase(fetchDataStructureProposalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(submitNewDataStructureProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitNewDataStructureProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals.unshift(action.payload);
      })
      .addCase(submitNewDataStructureProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(saveUpdatedDataStructureProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveUpdatedDataStructureProposal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.proposals.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.proposals[index] = action.payload;
        }
        if (state.currentProposal?.slug === action.payload.slug) {
          state.currentProposal = action.payload;
        }
      })
      .addCase(saveUpdatedDataStructureProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(reviewExistingDataStructureProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(reviewExistingDataStructureProposal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.proposals.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.proposals[index] = action.payload;
        }
      })
      .addCase(reviewExistingDataStructureProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeDataStructureProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeDataStructureProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = state.proposals.filter(p => p.slug !== action.meta.arg);
      })
      .addCase(removeDataStructureProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDataStructureProposalError, clearCurrentDataStructureProposal } = 
  dataStructureProposalSlice.actions;
  
export default dataStructureProposalSlice.reducer;