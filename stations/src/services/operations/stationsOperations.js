import { apiConnector } from "../apiConnector";
import { stationEndpoints } from "../apiEndpoints/stationsEndpoints.js";
import { clearStation } from "../../redux/slices/stationAuthSlice.js";
import { toast } from "sonner";


const { LOGIN_STATION_API, GET_STATION_BY_FINANCIAL_YEAR, UPDATE_REMARK_API, LOGOUT_STATION_API } = stationEndpoints;



export const loginStation = async (stationCode,email, password) => {
  try {
    const response = await apiConnector(
      "POST",
      LOGIN_STATION_API,
      { stationCode,email, password }
    );

    toast.success("Login successful");
    return response.data;
  } catch (error) {
    // console.error("Login Station API Error:", error);
    toast.error(
      error?.response?.data?.message || "Invalid station code or password"
    );
    throw error;
  }
};



export const getStationYearData = async (stationId, year = "") => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_STATION_BY_FINANCIAL_YEAR}/${stationId}/${year}`
    );

    return response.data;
  } catch (error) {
    console.error("Fetch FY Data Error:", error);
    toast.error("Failed to fetch financial year data");
    throw error;
  }
};



export const updateRemark = async (stationId, year, remark) => {
  try {
    const response = await apiConnector(
      "PUT",
      `${UPDATE_REMARK_API}/${stationId}/${year}`,
      { remark }
    );

    toast.success("Remark updated successfully");
    return response.data;
  } catch (err) {
    // console.error("Update Remark Error:", err);
    toast.error("Failed to update remark");
    throw err;
  }
};


export const logoutStation = (navigate) => async (dispatch) => {
  try {
    const response = await apiConnector(
      "POST",
      LOGOUT_STATION_API,
      null,
      { withCredentials: true }
    );

    if (!response?.data?.success) {
      toast.error("Logout failed");
      return;
    }

    dispatch(clearStation());

    toast.success("Logged out successfully");
    navigate("/");
  } catch (error) {
    // console.error("Logout Error:", error);
    toast.error("Logout failed");
  }
};