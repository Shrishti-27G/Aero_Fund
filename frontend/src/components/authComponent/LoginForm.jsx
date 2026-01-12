import { useState } from "react";
import { loginAdmin } from "../../services/operations/adminAuthOperations";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "sonner";

const LoginForm = ({ switchToRegister, closeModal }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();


        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (!password) {
            toast.error("Password is required");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        try {
            const user = await dispatch(loginAdmin(email, password, navigate));

            if (!user) {
                toast.error("Login failed");
                return;
            }

            closeModal();
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Invalid login credentials"
            );
        }
    };

    return (
        <form onSubmit={submitHandler}>
            {/* Email */}
            <input
                type="email"
                placeholder="Email"
                className="w-full p-2 mb-3 rounded bg-white text-black"
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            {/* Password Field with Custom Eye Toggle */}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full p-2 mb-4 rounded bg-white text-black pr-10"
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"   // removes browser auto-eye
                    required
                />

                {/* Show/Hide Icon */}
                <span
                    className="absolute right-3 top-5 -translate-y-1/2 cursor-pointer text-black text-2xl"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3  -translate-y-1/2 cursor-pointer text-gray-700 text-xl"
                    >
                        {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </span>
                </span>

            </div>

            <button className="w-full bg-blue-600 p-3 rounded-lg font-semibold">
                Login
            </button>

            <p
                className="mt-4 text-center text-blue-200 cursor-pointer"
                onClick={switchToRegister}
            >
                New user?
                <span className="relative font-semibold ml-2 text-red-400">
                    Register
                    <span
                        className="
    absolute
    -right-2
    top-1/2
    -translate-y-1/2
    h-1.5
    w-1.5
    bg-red-400
    rounded-full
    animate-bounce
    shadow-[0_0_8px_rgba(248,113,113,0.8)]
  "
                    />

                </span>
            </p>
        </form>
    );
};

export default LoginForm;
