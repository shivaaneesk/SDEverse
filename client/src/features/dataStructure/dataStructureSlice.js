import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createDataStructure,
  getAllDataStructures,
  getDataStructureBySlug,
  updateDataStructure,
  deleteDataStructure,
  voteDataStructure,
  getDataStructureCategories,
  searchDataStructures,
  addOperationImplementation,
  getDataStructureContributors,
} from "./dataStructureAPI";

const initialState = {
  dataStructures: [],
  dataStructure: null,
  categories: [],
  contributors: [],
  total: 0,
  pages: 0,
  currentPage: 1,
  loading: false,
  voteLoading: false,
  error: null,
};

const getToken = (getState) => getState().auth?.token;
const getUser = (getState) => getState().auth?.user;

export const createNewDataStructure = createAsyncThunk(
  "dataStructure/createNewDataStructure",
  async (dataStructureData, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    const user = getUser(getState);

    if (user?.role !== "admin") {
      return rejectWithValue("You are not authorized to create data structures.");
    }

    try {
      return await createDataStructure(dataStructureData, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchDataStructures = createAsyncThunk(
  "dataStructure/fetchDataStructures",
  async (params, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await getAllDataStructures(params, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchDataStructureBySlug = createAsyncThunk(
  "dataStructure/fetchDataStructureBySlug",
  async (slug, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await getDataStructureBySlug(slug, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateExistingDataStructure = createAsyncThunk(
  "dataStructure/updateExistingDataStructure",
  async ({ slug, dataStructureData }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    const user = getUser(getState);

    if (user?.role !== "admin") {
      return rejectWithValue("You are not authorized to update data structures.");
    }

    try {
      return await updateDataStructure(slug, dataStructureData, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteExistingDataStructure = createAsyncThunk(
  "dataStructure/deleteExistingDataStructure",
  async (slug, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    const user = getUser(getState);

    if (user?.role !== "admin") {
      return rejectWithValue("Only admins can delete data structures.");
    }

    try {
      await deleteDataStructure(slug, token);
      return slug;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const voteOnDataStructure = createAsyncThunk(
  "dataStructure/voteOnDataStructure",
  async ({ slug, voteData }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await voteDataStructure(slug, voteData, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchDataStructureCategories = createAsyncThunk(
  "dataStructure/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDataStructureCategories();
      return response.categories;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const searchAllDataStructures = createAsyncThunk(
  "dataStructure/searchAllDataStructures",
  async (params, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await searchDataStructures(params, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addNewOperationImplementation = createAsyncThunk(
  "dataStructure/addOperationImplementation",
  async ({ slug, implementationData }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await addOperationImplementation(slug, implementationData, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchDataStructureContributors = createAsyncThunk(
  "dataStructure/fetchContributors",
  async (slug, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    try {
      return await getDataStructureContributors(slug, token);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const dataStructureSlice = createSlice({
  name: "dataStructure",
  initialState,
  reducers: {
    resetDataStructureState: (state) => {
      state.loading = false;
      state.voteLoading = false;
      state.error = null;
    },
    clearDataStructure: (state) => {
      state.dataStructure = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataStructures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataStructures.fulfilled, (state, action) => {
        state.loading = false;
        state.dataStructures = action.payload.dataStructures;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchDataStructures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDataStructureBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataStructureBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.dataStructure = action.payload;
      })
      .addCase(fetchDataStructureBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createNewDataStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewDataStructure.fulfilled, (state, action) => {
        state.loading = false;
        state.dataStructures.unshift(action.payload);
      })
      .addCase(createNewDataStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateExistingDataStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingDataStructure.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.dataStructures.findIndex(
          (ds) => ds.slug === action.payload.slug
        );
        if (index !== -1) state.dataStructures[index] = action.payload;
        if (state.dataStructure?.slug === action.payload.slug) {
          state.dataStructure = action.payload;
        }
      })
      .addCase(updateExistingDataStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteExistingDataStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingDataStructure.fulfilled, (state, action) => {
        state.loading = false;
        state.dataStructures = state.dataStructures.filter(
          (ds) => ds.slug !== action.payload
        );
      })
      .addCase(deleteExistingDataStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(voteOnDataStructure.pending, (state) => {
        state.voteLoading = true;
        state.error = null;
      })
      .addCase(voteOnDataStructure.fulfilled, (state, action) => {
        state.voteLoading = false;
        const updated = action.payload.dataStructure;
        const index = state.dataStructures.findIndex(
          (ds) => ds.slug === updated.slug
        );
        if (index !== -1) state.dataStructures[index] = updated;
        if (state.dataStructure?.slug === updated.slug) {
          state.dataStructure = updated;
        }
      })
      .addCase(voteOnDataStructure.rejected, (state, action) => {
        state.voteLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchDataStructureCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataStructureCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchDataStructureCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(searchAllDataStructures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAllDataStructures.fulfilled, (state, action) => {
        state.loading = false;
        state.dataStructures = action.payload.dataStructures;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(searchAllDataStructures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addNewOperationImplementation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewOperationImplementation.fulfilled, (state, action) => {
        state.loading = false;
        if (state.dataStructure?.slug === action.payload.slug) {
          state.dataStructure = action.payload;
        }
      })
      .addCase(addNewOperationImplementation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDataStructureContributors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataStructureContributors.fulfilled, (state, action) => {
        state.loading = false;
        state.contributors = action.payload;
      })
      .addCase(fetchDataStructureContributors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDataStructureState, clearDataStructure } = dataStructureSlice.actions;
export default dataStructureSlice.reducer;