import { useState } from "react";
import { signupAdmin } from "../../services/operations/adminAuthOperations";
import { toast } from "sonner";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";


const SignupForm = ({ switchToLogin, closeModal }) => {
    const role = "admin"; // fixed role

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);


    const submitHandler = async (e) => {
        e.preventDefault();

       
        if (!name || name.trim().length < 3) {
            toast.error("Name must be at least 3 characters long");
            return;
        }

        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("Phone number must be 10 digits");
            return;
        }

    
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        try {
            const result = await signupAdmin(
                name,
                email,
                password,
                phone
            );

            if (!result) {
                toast.error("Signup failed");
                return;
            }

            toast.success("Account created! Please login.");
            switchToLogin(); 

        } catch (err) {
            toast.error("Something went wrong");
        }
    };



    return (
        <>
            <p className="text-center text-blue-300 font-semibold mb-4">
                Registering as <span className="text-blue-400">Admin</span>
            </p>

            <form onSubmit={submitHandler}>
                <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-2 mb-3 rounded bg-white text-black"
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 mb-3 rounded bg-white text-black"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Phone Number"
                    className="w-full p-2 mb-3 rounded bg-white text-black"
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        className="w-full p-2 mb-4 rounded bg-white text-black pr-10"
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />

                    {/*  Eye Toggle */}
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-5 -translate-y-1/2 cursor-pointer text-gray-700 text-xl"
                    >
                        {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </span>
                </div>


                <button className="w-full bg-blue-600 p-3 rounded-lg font-semibold">
                    Register as Admin
                </button>

                <p
                    className="mt-4 text-center text-blue-200 cursor-pointer"
                    onClick={switchToLogin}
                >
                    Already have an account?
                    <span className="relative font-semibold ml-2 text-red-400">
                        Login
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
        </>
    );
};

export default SignupForm;
