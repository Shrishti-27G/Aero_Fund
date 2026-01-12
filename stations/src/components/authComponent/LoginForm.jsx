import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setStation } from "../../redux/slices/stationAuthSlice.js";
import { loginStation } from "../../services/operations/stationsOperations.js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "sonner";

const LoginForm = ({ closeModal }) => {
  const [stationCode, setStationCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    
    if (!stationCode.trim()) {
      toast.error("Station code is required");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!password) {
      toast.error("Password is required");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await loginStation(
        stationCode.trim().toUpperCase(),
        email.trim(),
        password
      );

      if (!result?.station) {
        toast.error("Login failed");
        return; 
      }

      dispatch(setStation(result.station));
      closeModal();
      navigate("/dashboard");

    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Invalid login credentials"
      );
    } finally {
      setLoading(false); 
    }
  };



  return (
    <form onSubmit={submitHandler}>

      <input
        type="text"
        placeholder="Station Code"
        className="w-full p-2 mb-3 rounded bg-white text-black uppercase"
        value={stationCode}
        onChange={(e) => setStationCode(e.target.value.toUpperCase())}
        required
      />


      <input
        type="email"
        placeholder="Official Email"
        className="w-full p-2 mb-3 rounded bg-white text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />


      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full p-2 mb-4 rounded bg-white text-black pr-10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-5 -translate-y-1/2 cursor-pointer text-gray-700 text-xl"
        >
          {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
        </span>
      </div>


      <button
        disabled={loading}
        className="w-full bg-blue-600 p-3 rounded-lg font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
