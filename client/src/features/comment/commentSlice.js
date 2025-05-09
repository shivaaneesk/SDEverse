import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addComment,
  getCommentsByParent,
  addReplyToComment,
  deleteComment,
} from "./commentAPI";

const initialState = {
  comments: [],
  loading: false,
  error: null,
};

export const createComment = createAsyncThunk(
  "comment/createComment",
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await addComment(commentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCommentsByParent = createAsyncThunk(
  "comment/fetchCommentsByParent",
  async ({ parentType, parentId }, { rejectWithValue }) => {
    try {
      const response = await getCommentsByParent(parentType, parentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const replyToComment = createAsyncThunk(
  "comment/replyToComment",
  async ({ commentId, replyData }, { rejectWithValue }) => {
    try {
      const response = await addReplyToComment(commentId, replyData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeComment = createAsyncThunk(
  "comment/removeComment",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteComment(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCommentsByParent.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCommentsByParent.fulfilled, (state, action) => {
      state.loading = false;
      state.comments = action.payload;
    });
    builder.addCase(fetchCommentsByParent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Error fetching comments";
    });

    builder.addCase(createComment.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createComment.fulfilled, (state, action) => {
      state.loading = false;
      state.comments.unshift(action.payload);
    });
    builder.addCase(createComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Error creating comment";
    });

    builder.addCase(replyToComment.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(replyToComment.fulfilled, (state, action) => {
      state.loading = false;
      const updatedComment = state.comments.find(
        (comment) => comment._id === action.payload._id
      );
      if (updatedComment) {
        updatedComment.replies = action.payload.replies;
      }
    });
    builder.addCase(replyToComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Error replying to comment";
    });

    builder.addCase(removeComment.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(removeComment.fulfilled, (state, action) => {
      state.loading = false;
      state.comments = state.comments.filter(
        (comment) => comment._id !== action.payload._id
      );
    });
    builder.addCase(removeComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Error deleting comment";
    });
  },
});

export default commentSlice.reducer;
