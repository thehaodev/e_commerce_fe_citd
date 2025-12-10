import React, { useState } from "react";
import { FiMail, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { colors } from "../../components/landing/colors";
import { forgotPassword } from "../../api/authApi";

const fieldBase =
  "w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:border-black focus:ring-2 focus:ring-black/10 transition bg-white";

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

const getErrorMessage = (error, fallback) => {
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  return error?.message || fallback;
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(trimmedEmail);
      setSuccessMessage(
        "We have sent an OTP to your email. Please check your inbox."
      );
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(trimmedEmail)}`, {
          state: { email: trimmedEmail },
        });
      }, 500);
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to send the reset code. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -left-20 -top-24 w-80 h-80 rounded-full blur-3xl opacity-60"
          style={{ backgroundColor: "#FFF4C9" }}
        />
        <div
          className="absolute right-[-60px] top-10 w-96 h-96 rounded-full blur-3xl opacity-50"
          style={{ backgroundColor: "#FFE08A" }}
        />
        <div className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full border border-yellow-200 opacity-50" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-md bg-white border border-gray-100 mb-4">
            <span
              className="text-2xl font-extrabold"
              style={{ color: colors.primaryBlack }}
            >
              C
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: colors.primaryBlack }}
          >
            Forgot your password?
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Enter your account email and we will send you a one-time code to reset your password securely.
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
                  Password recovery
                </p>
                <h2
                  className="text-2xl font-bold mt-1"
                  style={{ color: colors.primaryBlack }}
                >
                  Send reset code
                </h2>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: "#FFF4C9",
                  color: colors.primaryBlack,
                }}
              >
                Secure
              </div>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="email"
                >
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
                    style={{ color: colors.primaryBlack }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-bold shadow-lg transition transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70"
                style={{
                  backgroundColor: colors.primaryYellow,
                  color: colors.primaryBlack,
                }}
              >
                {loading ? "Sending code..." : "Send reset code"}
                {!loading && <FiArrowRight />}
              </button>

              <p className="text-sm text-center text-gray-600">
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-bold text-gray-900 hover:underline"
                >
                  Go back to login
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
