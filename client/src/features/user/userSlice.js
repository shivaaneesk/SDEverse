import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllUsers,
  fetchUserById,
  deleteUserById,
  updateUserRole,
} from "./userAPI";

const initialState = {
  users: [],
  selectedUser: null,
  status: "idle",
  error: null,
};

export const getAllUsers = createAsyncThunk(
  "user/getAll",
  async (_, thunkAPI) => {
    try {
      return await fetchAllUsers();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getUserById = createAsyncThunk(
  "user/getById",
  async (id, thunkAPI) => {
    try {
      return await fetchUserById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const removeUser = createAsyncThunk(
  "user/delete",
  async (id, thunkAPI) => {
    try {
      await deleteUserById(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const changeUserRole = createAsyncThunk(
  "user/updateRole",
  async ({ id, role }, thunkAPI) => {
    try {
      return await updateUserRole(id, role);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
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
  },
  extraReducers: (builder) => {
    builder
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

      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
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
      });
  },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
