import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllUsers,
  fetchUserById,
  deleteUserById,
  updateUserRole,
  fetchMyProfile,
  updateMyProfile,
} from "./userAPI";

const initialState = {
  users: [],
  selectedUser: null,
  myProfile: null,
  status: "idle",
  error: null,
};

export const getAllUsers = createAsyncThunk(
  "user/getAll",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    console.log(token)
    try {
      return await fetchAllUsers(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
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
      return thunkAPI.rejectWithValue(error.response.data.message);
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
      return thunkAPI.rejectWithValue(error.response.data.message);
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
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getMyProfile = createAsyncThunk(
  "user/getMyProfile",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    console.log(token)

    try {
      return await fetchMyProfile(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
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
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
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
      // Admin users list
      .addCase(getAllUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Admin single user
      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })

      // Admin delete user
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      })

      // Admin update user role
      .addCase(changeUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.meta.arg.id
        );
        if (index !== -1) {
          state.users[index].role = action.meta.arg.role;
        }
      })

      // Current user profile
      .addCase(getMyProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myProfile = action.payload;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update current user profile
      .addCase(patchMyProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(patchMyProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myProfile = action.payload;
      })
      .addCase(patchMyProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearSelectedUser, clearMyProfile } = userSlice.actions;

export default userSlice.reducer;