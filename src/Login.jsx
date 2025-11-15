import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-[380px] rounded-3xl shadow-xl p-10">
        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-wide">
          WELCOME BACK
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Welcome back! Please enter your details.
        </p>

        {/* Email */}
        <div className="mb-5">
          <label className="font-semibold">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="font-semibold">Password</label>
          <input
            type="password"
            placeholder="*************"
            className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="flex justify-between items-center text-sm mb-5">
          <label className="flex items-center gap-2 text-gray-600">
            <input type="checkbox" /> Remember me
          </label>

          <button className="text-gray-600 hover:text-black font-medium">
            Forgot password
          </button>
        </div>

        {/* Sign in button */}
        <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium shadow-md transition">
          Sign in
        </button>

        {/* Google Sign in */}
        <button className="w-full mt-4 border border-gray-300 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition">
          <img
            src="https://www.google.com/favicon.ico"
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">
            Sign in with Google
          </span>
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <span className="text-red-500 font-semibold cursor-pointer">
            Sign up free!
          </span>
        </p>
      </div>
    </div>
  );
}
