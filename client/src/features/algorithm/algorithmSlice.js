import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAlgorithm,
  getAllAlgorithms,
  getAlgorithmBySlug,
  updateAlgorithm,
  deleteAlgorithm,
  voteAlgorithm,
  getCategories,
  searchAlgorithms,
} from "./algorithmAPI";

const initialState = {
  algorithms: [],
  algorithm: null,
  searchResults: [],
  categories: [],
  total: 0,
  pages: 0,
  currentPage: 1,
  loading: false,
  voteLoading: false,
  error: null,
};

const getToken = (getState) => getState().auth?.token;
const getUser = (getState) => getState().auth?.user; // returns full user object

export const createNewAlgorithm = createAsyncThunk(
  "algorithm/createNewAlgorithm",
  async (algorithmData, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    const user = getUser(getState);

    if (user?.role !== "admin") {
      return rejectWithValue("You are not authorized to create algorithms.");
    }

    try {
      return await createAlgorithm(algorithmData, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchAlgorithms = createAsyncThunk(
  "algorithm/fetchAlgorithms",
  async (params, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await getAllAlgorithms(params, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchAlgorithmBySlug = createAsyncThunk(
  "algorithm/fetchAlgorithmBySlug",
  async (slug, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await getAlgorithmBySlug(slug, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateExistingAlgorithm = createAsyncThunk(
  "algorithm/updateExistingAlgorithm",
  async ({ slug, algorithmData }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    const user = getUser(getState);

    if (user?.role !== "admin") {
      return rejectWithValue("You are not authorized to update algorithms.");
    }

    try {
      return await updateAlgorithm(slug, algorithmData, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteExistingAlgorithm = createAsyncThunk(
  "algorithm/deleteExistingAlgorithm",
  async (slug, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    const user = getUser(getState);

    if (user?.role !== "admin") {
      return rejectWithValue("Only admins can delete algorithms.");
    }

    try {
      await deleteAlgorithm(slug, token);
      return slug; // Return slug explicitly for reducer
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const voteOnAlgorithm = createAsyncThunk(
  "algorithm/voteOnAlgorithm",
  async ({ slug, voteData }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await voteAlgorithm(slug, voteData, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "algorithm/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategories();
      return response.categories;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const searchAllAlgorithms = createAsyncThunk(
  "algorithm/searchAllAlgorithms",
  async (params, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await searchAlgorithms(params, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const algorithmSlice = createSlice({
  name: "algorithm",
  initialState,
  reducers: {
    resetAlgorithmState: (state) => {
      state.loading = false;
      state.voteLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch Algorithms
      .addCase(fetchAlgorithms.pending, (state) => {
        state.loading = true;
        state.error = null; // clear previous errors
      })
      .addCase(fetchAlgorithms.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithms = action.payload.algorithms;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAlgorithms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single Algorithm
      .addCase(fetchAlgorithmBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlgorithmBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithm = action.payload;
      })
      .addCase(fetchAlgorithmBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Algorithm
      .addCase(createNewAlgorithm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewAlgorithm.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithms.unshift(action.payload);
      })
      .addCase(createNewAlgorithm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Algorithm
      .addCase(updateExistingAlgorithm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingAlgorithm.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.algorithms.findIndex(
          (a) => a.slug === action.payload.slug
        );
        if (index !== -1) state.algorithms[index] = action.payload;
        if (state.algorithm?.slug === action.payload.slug) {
          state.algorithm = action.payload;
        }
      })
      .addCase(updateExistingAlgorithm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Algorithm
      .addCase(deleteExistingAlgorithm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingAlgorithm.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithms = state.algorithms.filter(
          (a) => a.slug !== action.payload
        );
      })
      .addCase(deleteExistingAlgorithm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Vote on Algorithm
      .addCase(voteOnAlgorithm.pending, (state) => {
        state.voteLoading = true;
        state.error = null;
      })
      .addCase(voteOnAlgorithm.fulfilled, (state, action) => {
        state.voteLoading = false;
        const updated = action.payload.algorithm;
        const index = state.algorithms.findIndex(
          (a) => a.slug === updated.slug
        );
        if (index !== -1) state.algorithms[index] = updated;
        if (state.algorithm?.slug === updated.slug) state.algorithm = updated;
      })
      .addCase(voteOnAlgorithm.rejected, (state, action) => {
        state.voteLoading = false;
        state.error = action.payload;
      })

      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search Algorithms
      .addCase(searchAllAlgorithms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAllAlgorithms.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.results;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(searchAllAlgorithms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAlgorithmState } = algorithmSlice.actions;
export default algorithmSlice.reducer;
