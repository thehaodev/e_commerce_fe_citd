import React, { useEffect, useMemo, useState } from "react";
import { FiMail, FiKey, FiLock } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../../components/landing/colors";
import { resetPassword } from "../../api/authApi";
import mapBackendErrors from "../../utils/mapBackendErrors";

const fieldBase =
  "w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:border-black focus:ring-2 focus:ring-black/10 transition bg-white";

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

const getErrorMessage = (error, fallback) => {
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  return error?.message || fallback;
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location?.state?.email;
  const emailFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("email") || "";
  }, [location.search]);

  const [email, setEmail] = useState(emailFromState || emailFromQuery || "");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (emailFromState || emailFromQuery) {
      setEmail(emailFromState || emailFromQuery);
    }
  }, [emailFromQuery, emailFromState]);

  const validate = () => {
    const errors = {};
    const trimmedEmail = email.trim();
    const trimmedOtp = otpCode.trim();

    if (!trimmedEmail) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!trimmedOtp) {
      errors.otp_code = "OTP code is required.";
    }

    if (!newPassword) {
      errors.new_password = "New password is required.";
    } else {
      if (newPassword.length < 8) {
        errors.new_password = "Password must be at least 8 characters.";
      } else if (!/[A-Z]/.test(newPassword)) {
        errors.new_password = "Password must include an uppercase letter.";
      } else if (!/[a-z]/.test(newPassword)) {
        errors.new_password = "Password must include a lowercase letter.";
      } else if (!/[0-9]/.test(newPassword)) {
        errors.new_password = "Password must include a number.";
      }
    }

    if (!confirmPassword) {
      errors.confirm_password = "Please confirm your new password.";
    } else if (confirmPassword !== newPassword) {
      errors.confirm_password = "Passwords do not match.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await resetPassword({
        email: email.trim(),
        otp_code: otpCode.trim(),
        new_password: newPassword,
      });
      setSuccessMessage(
        "Your password has been reset successfully. You can now log in."
      );
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 600);
    } catch (error) {
      setFieldErrors((prev) => ({
        ...prev,
        ...mapBackendErrors(error),
      }));
      setFormError(
        getErrorMessage(
          error,
          "Unable to reset password. Please check the OTP code and try again."
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
            Reset your password
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Enter the email you used to sign up, the OTP code we sent, and your new password to access your account again.
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
                  Secure reset
                </p>
                <h2
                  className="text-2xl font-bold mt-1"
                  style={{ color: colors.primaryBlack }}
                >
                  Choose a new password
                </h2>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: "#FFF4C9",
                  color: colors.primaryBlack,
                }}
              >
                OTP Required
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
                {fieldErrors?.email && (
                  <p className="text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="otpCode"
                >
                  OTP code
                </label>
                <div className="relative">
                  <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="otpCode"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    className={fieldBase}
                    placeholder="Enter the 6-digit code"
                  />
                </div>
                {fieldErrors?.otp_code && (
                  <p className="text-xs text-red-600">{fieldErrors.otp_code}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-gray-700"
                    htmlFor="newPassword"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className={fieldBase}
                      placeholder="Create a strong password"
                    />
                  </div>
                  {fieldErrors?.new_password && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.new_password}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Use at least 8 characters including uppercase, lowercase, and a number.
                  </p>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-gray-700"
                    htmlFor="confirmPassword"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={fieldBase}
                      placeholder="Re-enter new password"
                    />
                  </div>
                  {fieldErrors?.confirm_password && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.confirm_password}
                    </p>
                  )}
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
                {loading ? "Resetting password..." : "Reset password"}
              </button>

              <p className="text-sm text-center text-gray-600">
                Already remember it?{" "}
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

export default ResetPasswordPage;
