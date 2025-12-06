import React, { useState } from "react";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useAuth, { getRedirectPathForRole } from "../../hooks/useAuth";
import mapBackendErrors from "../../utils/mapBackendErrors";

const fieldBase =
  'w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:border-black focus:ring-2 focus:ring-black/10 transition bg-white';

const LoginModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const authData = await login({ email, password });
      const role = authData?.user?.role;
      navigate(getRedirectPathForRole(role));
      onClose?.();
    } catch (err) {
      setFieldErrors(mapBackendErrors(err));
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"></div>
      <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
        <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            X
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl shadow-md bg-white border border-gray-100 mb-4">
              <span className="text-xl font-extrabold text-black">
                C
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-black">
              Welcome back to CABIN
            </h1>
            <p className="text-gray-600 mt-2">
              Sign in to continue to the logistics platform.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={fieldBase}
                  placeholder="you@company.com"
                />
                {fieldErrors?.email && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={fieldBase}
                  placeholder="Enter your password"
                />
                {fieldErrors?.password && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <a href="#" className="font-semibold text-gray-700 hover:text-black">
                Forgot your password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-bold shadow-lg transition transform hover:-translate-y-0.5 hover:shadow-xl"
              style={{ backgroundColor: '#F4C02A', color: '#151515' }}
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 border-2 border-black/40 border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight />
                </>
              )}
            </button>

            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  navigate("/register");
                  onClose?.();
                }}
                className="font-bold text-gray-900 hover:underline"
              >
                Create one
              </button>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
