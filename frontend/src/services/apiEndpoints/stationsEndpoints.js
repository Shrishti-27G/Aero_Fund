const BASE_URL = import.meta.env.VITE_APP_BASE_URL;



export const stationEndpoints = {
    Create_Stations_API: BASE_URL + "/stations/create-station",
    Get_All_Stations_API: BASE_URL + "/stations/get-all-stations",
    Update_Budget_API: BASE_URL + "/stations/update-budget",
    Delete_Station_API: BASE_URL + "/stations/delete-station",
    Delete_Financial_Year_API: BASE_URL + "/stations/delete-financial-year",
    Update_Admin_Yearly_Budget : BASE_URL + "/stations/update-admin-yearly-budget",
    Get_Admin_Yearly_Budget: BASE_URL + "/stations/get-admin-yearly-budget"
};
