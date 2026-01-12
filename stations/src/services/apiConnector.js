import axios from "axios";
import store from "../redux/store";
import { clearStation } from "../redux/slices/stationAuthSlice";
import { stationEndpoints } from "./apiEndpoints/stationsEndpoints";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  withCredentials: true, // Allows cookies to be sent and received
});


export const apiConnector = (method, url, bodyData, headers = {}, params = {}) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
    withCredentials: true,
  });
};





axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        console.warn("🔄 Access token expired → Trying refresh...");

        // ✅ USE ENV BASE URL INSTEAD OF HARDCODED
        await axios.post(
          authEnpoint.Refresh_Token_API,
          {},
          { withCredentials: true }
        );

        console.warn("✅ New access token issued");

        // ✅ RETRY ORIGINAL API
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error("❌ Refresh token expired → Logging out");

        store.dispatch(clearStation());
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



