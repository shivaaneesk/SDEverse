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
  categories: [],
  total: 0,
  pages: 0,
  currentPage: 1,
  loading: false,
  voteLoading: false, // ✅
  error: null,
};

export const createNewAlgorithm = createAsyncThunk(
  "algorithm/createNewAlgorithm",
  async (algorithmData, { rejectWithValue }) => {
    try {
      const response = await createAlgorithm(algorithmData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchAlgorithms = createAsyncThunk(
  "algorithm/fetchAlgorithms",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAllAlgorithms(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchAlgorithmBySlug = createAsyncThunk(
  "algorithm/fetchAlgorithmBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await getAlgorithmBySlug(slug);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const updateExistingAlgorithm = createAsyncThunk(
  "algorithm/updateExistingAlgorithm",
  async ({ slug, algorithmData }, { rejectWithValue }) => {
    try {
      const response = await updateAlgorithm(slug, algorithmData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const deleteExistingAlgorithm = createAsyncThunk(
  "algorithm/deleteExistingAlgorithm",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await deleteAlgorithm(slug);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const voteOnAlgorithm = createAsyncThunk(
  "algorithm/voteOnAlgorithm",
  async ({ slug, voteData, token }, { rejectWithValue }) => {
    try {
      const response = await voteAlgorithm(slug, voteData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
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
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const searchAllAlgorithms = createAsyncThunk(
  "algorithm/searchAllAlgorithms",
  async (params, { rejectWithValue }) => {
    try {
      const response = await searchAlgorithms(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

const algorithmSlice = createSlice({
  name: "algorithm",
  initialState,
  reducers: {
    resetAlgorithmState: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAlgorithms.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAlgorithms.fulfilled, (state, action) => {
      state.loading = false;
      state.algorithms = action.payload.algorithms;
      state.total = action.payload.total;
      state.pages = action.payload.pages;
      state.currentPage = action.payload.currentPage;
    });
    builder.addCase(fetchAlgorithms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    });

    builder.addCase(fetchAlgorithmBySlug.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAlgorithmBySlug.fulfilled, (state, action) => {
      state.loading = false;
      state.algorithm = action.payload;
    });
    builder.addCase(fetchAlgorithmBySlug.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    });

    builder.addCase(createNewAlgorithm.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createNewAlgorithm.fulfilled, (state, action) => {
      state.loading = false;
      state.algorithms.unshift(action.payload);
    });
    builder.addCase(createNewAlgorithm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    });

    builder.addCase(updateExistingAlgorithm.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateExistingAlgorithm.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.algorithms.findIndex(
        (algo) => algo.slug === action.payload.slug
      );
      if (index !== -1) {
        state.algorithms[index] = action.payload;
      }
    });
    builder.addCase(updateExistingAlgorithm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    });

    builder.addCase(deleteExistingAlgorithm.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteExistingAlgorithm.fulfilled, (state, action) => {
      state.loading = false;
      state.algorithms = state.algorithms.filter(
        (algo) => algo.slug !== action.payload.slug
      );
    });
    builder.addCase(deleteExistingAlgorithm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    });

    builder.addCase(voteOnAlgorithm.pending, (state) => {
      state.voteLoading = true;
    });

    builder.addCase(voteOnAlgorithm.fulfilled, (state, action) => {
      state.voteLoading = false;
      const updatedAlgo = action.payload.algorithm;

      const index = state.algorithms.findIndex(
        (algo) => algo.slug === updatedAlgo.slug
      );
      if (index !== -1) {
        state.algorithms[index] = updatedAlgo;
      }

      if (state.algorithm?.slug === updatedAlgo.slug) {
        state.algorithm = updatedAlgo;
      }
    });

    builder.addCase(voteOnAlgorithm.rejected, (state, action) => {
      state.voteLoading = false;
      state.error = action.payload || "Something went wrong";
    });

    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    });

    builder.addCase(searchAllAlgorithms.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(searchAllAlgorithms.fulfilled, (state, action) => {
      state.loading = false;
      state.algorithms = action.payload.algorithms;
      state.total = action.payload.total;
      state.pages = action.payload.pages;
      state.currentPage = action.payload.currentPage;
    });
    builder.addCase(searchAllAlgorithms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    });
  },
});

export const { resetAlgorithmState } = algorithmSlice.actions;
export default algorithmSlice.reducer;
