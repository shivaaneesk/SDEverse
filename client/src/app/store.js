import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import algorithmReducer from "../features/algorithm/algorithmSlice";
import commentReducer from "../features/comment/commentSlice";
import userReducer from "../features/user/userSlice";
import themeReducer from "../features/theme/themeSlice";
import proposalReducer from "../features/proposal/proposalSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    algorithm: algorithmReducer,
    comment: commentReducer,
    user: userReducer,
    theme: themeReducer,
    proposal: proposalReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});

export default store;