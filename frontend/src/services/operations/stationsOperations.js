import { apiConnector } from "../apiConnector";
import { toast } from "sonner";
import { stationEndpoints } from "../apiEndpoints/stationsEndpoints.js"


export const { Create_Stations_API, Get_All_Stations_API, Update_Budget_API, Delete_Financial_Year_API, Delete_Station_API, Get_Admin_Yearly_Budget, Update_Admin_Yearly_Budget } = stationEndpoints;



export const createStation = (
  stationName,
  stationCode,
  password,
  email,
  financialYear
) => async (dispatch) => {
  const toastId = toast.loading("Creating station...");

  try {
    const response = await apiConnector(
      "POST",
      Create_Stations_API,
      {
        stationName,
        stationCode,
        password,
        email,
        financialYear,
      }
    );

    if (!response?.data) {
      toast.error("Station creation failed", { id: toastId });
      return null;
    }

    toast.success(
      response.data.message || "Station created successfully",
      { id: toastId }
    );

    return response.data.station || response.data;

  } catch (error) {
    // console.log("CREATE STATION ERROR →", error);

    const msg =
      error?.response?.data?.message ||
      "Something went wrong. Please try again.";

    toast.error(msg, { id: toastId });
    return null;
  }
};


export const getAllStations = (year) => async (dispatch) => {
  const toastId = toast.loading("Fetching stations...");

  try {
    const url = year
      ? `${Get_All_Stations_API}?year=${year}`
      : Get_All_Stations_API;

    const response = await apiConnector("GET", url);

    if (!response?.data) {
      toast.error("Failed to fetch stations", { id: toastId });
      return null;
    }

    const stations = response.data.stations || response.data;

    
    if (Array.isArray(stations) && stations.length > 0) {
      toast.success(`Found ${stations.length} station(s)`, {
        id: toastId,
      });
    } else {
      toast.warning("No stations found", { id: toastId });
    }

    return stations;

  } catch (error) {
    // console.log("GET ALL STATIONS ERROR →", error);

    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Server Error";

    toast.error(msg, { id: toastId });
    return null;
  }
};


export const updateYearlyBudget = (
  stationId,
  year,
  budgetData
) => async (dispatch) => {
  const toastId = toast.loading("Updating budget...");

  try {
    const response = await apiConnector(
      "PUT",
      `${Update_Budget_API}/${stationId}/${year}`,
      budgetData
    );

    if (!response?.data) {
      toast.error("Budget update failed", { id: toastId });
      return null;
    }

    toast.success(
      response.data.message || "Budget updated successfully",
      { id: toastId }
    );

    return response.data;

  } catch (error) {
    // console.log("UPDATE YEARLY BUDGET ERROR →", error);

    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Server Error";

    toast.error(msg, { id: toastId });
    return null;
  }
};




export const deleteStation = (stationId) => async (dispatch) => {
  const toastId = toast.loading("Deleting station...");

  try {
    const response = await apiConnector(
      "DELETE",
      `${Delete_Station_API}/${stationId}`
    );

    if (!response?.data?.success) {
      toast.error("Failed to delete station", { id: toastId });
      return false;
    }

    toast.success(
      response.data.message || "Station deleted successfully",
      { id: toastId }
    );

    return true;

  } catch (error) {
    // console.error("DELETE STATION ERROR →", error);

    const msg =
      error?.response?.data?.message ||
      "Server error while deleting station";

    toast.error(msg, { id: toastId });
    return false;
  }
};




export const deleteFinancialYear = (stationId, year) => async (dispatch) => {
  const toastId = toast.loading(
    `Deleting FY ${year}-${year + 1}...`
  );

  try {
    const response = await apiConnector(
      "DELETE",
      `${Delete_Financial_Year_API}/${stationId}/year/${year}`
    );

    if (!response?.data?.success) {
      toast.error("Failed to delete financial year", { id: toastId });
      return false;
    }

    toast.success(
      response.data.message ||
      `Financial Year ${year}-${year + 1} deleted`,
      { id: toastId }
    );

    return true;

  } catch (error) {
    // console.error("DELETE FINANCIAL YEAR ERROR →", error);

    const msg =
      error?.response?.data?.message ||
      "Server error while deleting financial year";

    toast.error(msg, { id: toastId });
    return false;
  }
};


export const getSupervisorBudgetByYear = (year) => async (dispatch) => {
  try {
    // console.log("Year -> ", year);

    const res = await apiConnector(
      "GET",
      `${Get_Admin_Yearly_Budget}/${year}`
    );

    if (!res?.data?.budget) {
      toast.error("Admin budget not found");
      return null;
    }

    return res.data.budget; 
  } catch (error) {
    // console.error("Get Supervisor Budget Error:", error);

    const msg =
      error?.response?.data?.message ||
      "Failed to fetch admin budget";

    toast.error(msg);
    return null;
  }
};



export const updateSupervisorYearlyBudget =
  (year, totalAllocatedToMe) => async (dispatch) => {

    const toastId = toast.loading("Updating admin budget...");

    try {
      const res = await apiConnector(
        "PUT",
        Update_Admin_Yearly_Budget,
        {
          year,
          totalAllocatedToMe,
        }
      );

      if (!res?.data?.success) {
        toast.error("Failed to update budget", { id: toastId });
        return null;
      }

      toast.success(
        res.data.message || "Admin budget updated successfully",
        { id: toastId }
      );

      return res.data;

    } catch (error) {
      // console.error("Update Supervisor Budget Error:", error);

      const msg =
        error?.response?.data?.message ||
        "Server error while updating budget";

      toast.error(msg, { id: toastId });
      return null;
    }
  };
