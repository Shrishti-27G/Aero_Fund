import { configureStore } from "@reduxjs/toolkit";
import adminAuthReducer from "./slices/adminAuthSlice.js"; // Example reducer

const store = configureStore({
  reducer: {
    auth: adminAuthReducer,
  },

});

export default store;