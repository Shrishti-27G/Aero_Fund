import { configureStore } from "@reduxjs/toolkit";
import stationAuthSlice from "./slices/stationAuthSlice.js";

const store = configureStore({
  reducer: {
    auth: stationAuthSlice,
  },

});

export default store;