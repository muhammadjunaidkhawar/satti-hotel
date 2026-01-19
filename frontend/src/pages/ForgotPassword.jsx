import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      
      {/* Heading outside the card */}
      <h1 className="text-3xl font-semibold mb-6 text-[#FF9500] text-center">
        7E POS
      </h1>

      {/* Forgot Password Card */}
      <div className="w-full max-w-md h-[400px] p-8 bg-[#2a2a2a] rounded-3xl shadow-lg text-center">
        <h2 className="text-xl mb-2">Forgot Your Password?</h2>
        <p className="text-sm text-gray-400 mb-6">
          Please enter your username or email to recover your password
        </p>

        {/* Username Input */}
        <div className="mb-4 text-left">
          <label className="block text-gray-300 text-sm mb-2">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 placeholder:text-xs rounded-md bg-[#3a3a3a] text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
          />
        </div>

        {/* Submit Button */}
        <button className="w-[110px] h-[40px] text-xs py-2 mt-4 rounded-md bg-[#FF9500] hover:bg-[#e68806] text-black font-semibold">
          Submit Now
        </button>

        {/* Back to Login */}
        <div className="mt-20 text-sm">
          <Link to="/" className="text-[#ffffff] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
