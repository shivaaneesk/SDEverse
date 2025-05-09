import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import algorithmReducer from "../features/algorithm/algorithmSlice";
import commentReducer from "../features/comment/commentSlice";
import contributionReducer from "../features/contribution/contributionSlice";
import userReduccer from "../features/user/userSlice";
import themeReducer from "../features/theme/themeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    algorithm: algorithmReducer,
    comment: commentReducer,
    contribution: contributionReducer,
    user: userReduccer,
    theme: themeReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
