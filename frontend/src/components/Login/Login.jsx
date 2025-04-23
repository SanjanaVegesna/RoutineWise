import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import useFormFields from "../../hooks/useFormFields";

const Login = () => {
  const navigate = useNavigate();
  const [fields, handleChange, resetFields] = useFormFields({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, fields.email, fields.password);
      toast.success("Login Successful!");
      resetFields();
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in with Google!");
      resetFields();
      navigate("/dashboard");
    } catch (err) {
      toast.error("Google Sign-in failed");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center md:justify-start px-4 md:px-16 relative"
      style={{
        backgroundImage: "url('/images/login-bg.png')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-0" />

      <div className="relative z-10 bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md md:ml-12 text-green-800">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Welcome to RoutineWise</h2>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-800 text-black placeholder-gray-500"
            value={fields.email}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full px-4 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-800 text-black placeholder-gray-500"
              value={fields.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-sm text-gray-500 cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <div className="text-right text-sm mb-2">
            <Link to="/forgot-password" className="text-green-700 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-800 text-white py-2 rounded transition text-sm sm:text-base"
          >
            Sign in with Email
          </button>
        </form>

        <div className="text-center my-4 text-gray-400 text-sm">or</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm sm:text-base"
        >
          Sign in with Google
        </button>

        <p className="text-sm text-center mt-4 text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-700 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
