const BASE_URL = import.meta.env.VITE_APP_BASE_URL;



export const authEnpoint = {
  Login_Admin_API: BASE_URL + "/admin-auth/login",
  Signup_Admin_API: BASE_URL + "/admin-auth/signup",
  Logout_Admin_API: BASE_URL + "/admin-auth/logout",
  Refresh_Token_API: BASE_URL + "/admin-auth/refresh-token",
};
