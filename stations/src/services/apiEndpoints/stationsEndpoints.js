const BASE_URL = import.meta.env.VITE_APP_BASE_URL;



export const stationEndpoints = {
  // 🔐 AUTH
  LOGIN_STATION_API: BASE_URL + "/stations/login",
  LOGOUT_STATION_API: BASE_URL + "/stations/logout",
  REFRESH_TOKEN_API: BASE_URL + "/stations/refresh-token",
  UPDATE_REMARK_API: "/stations/update-remark",
  Refresh_Token_API: BASE_URL + "/stations/refresh-token",
  GET_STATION_BY_FINANCIAL_YEAR: BASE_URL + "/stations/get-station-detail-by-financial-year",
};
