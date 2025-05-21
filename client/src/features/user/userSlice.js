import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllUsers,
  fetchUserById,
  deleteUserById,
  updateUserRole,
  fetchMyProfile,
  updateMyProfile,
  updateSocialProfiles,
  updateCompetitiveStats,
} from "./userAPI";

const initialState = {
  users: [],
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  selectedUser: null,
  myProfile: null,
  extraCompetitiveStats: null,
  status: {
    fetchUsers: "idle",
    fetchProfile: "idle",
    updateProfile: "idle",
    updateSocialStats: "idle",
    updateCompetitiveStats: "idle",
  },
  error: {
    fetchUsers: null,
    fetchProfile: null,
    updateProfile: null,
    updateSocialStats: null,
    updateCompetitiveStats: null,
    fetchSelectedUser: null,
  },
};

const safeReject = (error) =>
  error.response?.data?.message || error.message || "Unknown error";

export const getAllUsers = createAsyncThunk(
  "user/getAll",
  async (params = {}, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;

    const finalParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
    };

    try {
      return await fetchAllUsers(token, finalParams);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const getUserById = createAsyncThunk(
  "user/getById",
  async (id, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await fetchUserById(id, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const removeUser = createAsyncThunk(
  "user/delete",
  async (id, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      await deleteUserById(id, token);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const changeUserRole = createAsyncThunk(
  "user/updateRole",
  async ({ id, role }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateUserRole(id, role, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const getMyProfile = createAsyncThunk(
  "user/getMyProfile",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await fetchMyProfile(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const patchMyProfile = createAsyncThunk(
  "user/patchMyProfile",
  async (profileData, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateMyProfile(profileData, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const refreshSocialStats = createAsyncThunk(
  "user/refreshSocialStats",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateSocialProfiles(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

export const refreshCompetitiveStats = createAsyncThunk(
  "user/refreshCompetitiveStats",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      return await updateCompetitiveStats(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(safeReject(error));
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearMyProfile: (state) => {
      state.myProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.status.fetchUsers = "loading";
        state.error.fetchUsers = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.status.fetchUsers = "succeeded";
        state.users = action.payload.users;
        state.totalUsers = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.status.fetchUsers = "failed";
        state.error.fetchUsers = action.payload;
      })

      .addCase(getUserById.pending, (state) => {
        state.status.fetchSelectedUser = "loading";
        state.error.fetchSelectedUser = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.status.fetchSelectedUser = "succeeded";
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.status.fetchSelectedUser = "failed";
        state.error.fetchSelectedUser = action.payload;
      })

      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      })

      .addCase(changeUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.meta.arg.id
        );
        if (index !== -1) {
          state.users[index].role = action.meta.arg.role;
        }
      })

      .addCase(getMyProfile.pending, (state) => {
        state.status.fetchProfile = "loading";
        state.error.fetchProfile = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.status.fetchProfile = "succeeded";
        state.myProfile = action.payload;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.status.fetchProfile = "failed";
        state.error.fetchProfile = action.payload;
      })

      .addCase(patchMyProfile.pending, (state) => {
        state.status.updateProfile = "loading";
        state.error.updateProfile = null;
      })
      .addCase(patchMyProfile.fulfilled, (state, action) => {
        state.status.updateProfile = "succeeded";
        state.myProfile = {
          ...state.myProfile,
          ...action.payload,
        };
      })
      .addCase(patchMyProfile.rejected, (state, action) => {
        state.status.updateProfile = "failed";
        state.error.updateProfile = action.payload;
      })

      .addCase(refreshSocialStats.pending, (state) => {
        state.status.updateSocialStats = "loading";
        state.error.updateSocialStats = null;
      })
      .addCase(refreshSocialStats.fulfilled, (state, action) => {
        state.status.updateSocialStats = "succeeded";
        if (state.myProfile) {
          state.myProfile.socialStats = action.payload;
        }
      })
      .addCase(refreshSocialStats.rejected, (state, action) => {
        state.status.updateSocialStats = "failed";
        state.error.updateSocialStats = action.payload;
      })

      .addCase(refreshCompetitiveStats.pending, (state) => {
        state.status.updateCompetitiveStats = "loading";
        state.error.updateCompetitiveStats = null;
      })
      .addCase(refreshCompetitiveStats.fulfilled, (state, action) => {
        state.status.updateCompetitiveStats = "succeeded";
        if (state.myProfile) {
          state.myProfile.competitiveStats = action.payload.competitiveStats;

          const extraStats = action.payload.extraStats || {};

          state.myProfile.extraCompetitiveStats = {};

          for (const platform in extraStats) {
            state.myProfile.extraCompetitiveStats[platform] = {
              profileUrl: extraStats[platform]?.profileUrl || "",
              moreInfo: extraStats[platform]?.moreInfo || {},
            };
          }
        }
      })

      .addCase(refreshCompetitiveStats.rejected, (state, action) => {
        state.status.updateCompetitiveStats = "failed";
        state.error.updateCompetitiveStats = action.payload;
      });
  },
});

export const { clearSelectedUser, clearMyProfile } = userSlice.actions;
export default userSlice.reducer;
