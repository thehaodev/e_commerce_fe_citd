import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../../api/authApi";
import useAuth, { getRedirectPathForRole } from "../../hooks/useAuth";

const OtpModal = ({
  open,
  email,
  password,
  onClose,
  onSuccess,
  onResend,
}) => {
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    if (timeLeft <= 0) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, timeLeft]);

  useEffect(() => {
    if (!open) return undefined;
    setOtpValues(Array(6).fill(""));
    setError("");
    setTimeLeft(60);
    const timer = setTimeout(() => {
      inputRefs.current?.[0]?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, [open, email]);

  const getErrorMessage = (err) => {
    if (!err) return "Không thể xác thực OTP. Vui lòng thử lại.";
    if (err.fields?.otp_code) return err.fields.otp_code;
    if (typeof err?.message === "string") return err.message;
    return "Không thể xác thực OTP. Vui lòng thử lại.";
  };

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpValues((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    setOtpValues((prev) => {
      const next = [...prev];
      text.split("").forEach((char, idx) => {
        if (idx < 6) next[idx] = char;
      });
      return next;
    });
    const lastIndex = Math.min(text.length, 6) - 1;
    inputRefs.current[lastIndex]?.focus();
  };

  const handleResend = async () => {
    if (timeLeft > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await onResend?.();
      setTimeLeft(60);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!open) return;
    const otp = otpValues.join("");
    if (otp.length < 6) {
      setError("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }
    if (!email || !password) {
      setError("Thiếu thông tin đăng ký. Vui lòng thử lại.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOtp({
        email,
        otp_code: otp,
        purpose: "REGISTER",
      });

      const authData = await login({
        email,
        password,
      });

      onSuccess?.();
      onClose?.();
      const role = authData?.user?.role;
      navigate(getRedirectPathForRole(role));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-200 via-white to-amber-100 opacity-70 blur" />
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 px-8 py-7 space-y-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            &#x2715;
          </button>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">
              Security Check
            </p>
            <h3 className="text-2xl font-semibold text-gray-900">Xác thực OTP</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vui lòng nhập mã OTP đã gửi đến email của bạn
              {email ? <span className="ml-1 font-semibold text-gray-800">{email}</span> : null}.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-2">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-12 rounded-xl border border-gray-200 text-center text-lg font-semibold text-gray-900 shadow-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                  value={value}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onPaste={handlePaste}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </div>
            ) : (
              <div className="h-3" />
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="font-semibold text-gray-700">
                00:{timeLeft.toString().padStart(2, "0")}
              </div>
              {timeLeft > 0 ? (
                <span className="text-gray-500">Gửi lại OTP sau {timeLeft}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-amber-600 font-semibold hover:text-amber-700 disabled:opacity-50"
                >
                  {resending ? "Đang gửi..." : "Gửi lại OTP"}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && (
                <span className="h-5 w-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Đang xác thực..." : "Xác nhận OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
