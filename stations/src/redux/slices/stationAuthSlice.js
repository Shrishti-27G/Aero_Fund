import { createSlice } from "@reduxjs/toolkit";


const storedStation = localStorage.getItem("station");

const initialState = {
  user: storedStation ? JSON.parse(storedStation) : null,
  isAuthenticated: !!storedStation,
};

const stationAuthSlice = createSlice({
  name: "stationAuth",
  initialState,
  reducers: {
    
    setStation: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("station", JSON.stringify(action.payload));
    },


    clearStation: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("station");
    },
  },
});

export const { setStation, clearStation } = stationAuthSlice.actions;
export default stationAuthSlice.reducer;
