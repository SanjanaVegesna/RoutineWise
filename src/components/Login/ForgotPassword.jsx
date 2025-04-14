import React from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import useFormFields from "../../hooks/useFormFields";

const ForgotPassword = () => {
  const [fields, handleChange, resetFields] = useFormFields({ email: "" });

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, fields.email);
      toast.success("Reset link sent to your email!");
      resetFields();
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center md:justify-start px-4 md:px-16 relative"
      style={{ backgroundImage: "url('/images/login-bg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-0" />

      <div className="relative z-10 bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md md:ml-12 text-green-800">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Reset your password
        </h2>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-800 text-black placeholder-gray-500"
            value={fields.email}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-800 text-white py-2 rounded transition text-sm sm:text-base"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" className="text-green-800 underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
