import { apiConnector } from "../apiConnector";
import { authEnpoint } from "../apiEndpoints/adminAuthEndpoints.js";
import { toast } from "sonner";
import { setAdmin } from "../../redux/slices/adminAuthSlice.js";

const { Login_Admin_API, Signup_Admin_API, Logout_Admin_API } = authEnpoint;

export const loginAdmin = (email, password, navigate) => async (dispatch) => {
    const toastId = toast.loading("Signing in...");

    try {
        const response = await apiConnector(
            "POST",
            Login_Admin_API,
            { email, password }
        );

        if (!response?.data?.supervisor) {
            toast.error("Login failed", { id: toastId });
            return null;
        }

        dispatch(setAdmin(response.data.supervisor));

        toast.success(
            `Welcome back, ${response.data.supervisor.name}`,
            { id: toastId }
        );

        navigate("/stations");

        return response.data.supervisor;

    } catch (error) {

        const msg =
            error?.response?.data?.message ||
            "Invalid email or password";

        toast.error(msg, { id: toastId });
        return null;
    }
};


export const signupAdmin = async (name, email, password, phone) => {
    const toastId = toast.loading("Creating your account...");

    try {
        const response = await apiConnector(
            "POST",
            Signup_Admin_API,
            { name, email, password, phone }
        );

        if (!response?.data?.supervisor) {
            toast.error("Signup failed", { id: toastId });
            return null;
        }

        toast.success(
            "Account created successfully! Please login.",
            { id: toastId }
        );

        return response.data.supervisor;

    } catch (error) {

        const msg =
            error?.response?.data?.message ||
            "Server error during signup";

        toast.error(msg, { id: toastId });
        return null;
    }
};



export const logoutAdmin = (navigate) => async (dispatch) => {
    const toastId = toast.loading("Logging out...");

    try {
        const response = await apiConnector(
            "POST",
            Logout_Admin_API,
            null,
            { withCredentials: true }
        );

        if (!response?.data?.success) {
            toast.error("Logout failed", { id: toastId });
            return;
        }

        dispatch(setAdmin(null));

        toast.success("Logged out successfully", { id: toastId });

        navigate("/");

    } catch (error) {
        toast.error("Logout failed", { id: toastId });
    }
};
