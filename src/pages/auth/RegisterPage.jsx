import React, { useState } from "react";
import BuyerRegisterForm from "../../components/register/BuyerRegisterForm";
import SellerRegisterForm from "../../components/register/SellerRegisterForm";
import ProviderRegisterForm from "../../components/register/ProviderRegisterForm";
import OtpModal from "../../components/register/OtpModal";
import {
  registerBuyer,
  registerSeller,
  registerProvider,
} from "../../api/authApi";

const RegisterPage = () => {
  const [role, setRole] = useState("BUYER");
  const [showOtp, setShowOtp] = useState(false);
  const [otpData, setOtpData] = useState(null);

  const activeButton =
    "flex-1 py-2.5 rounded-lg text-sm font-bold bg-white text-primary-black shadow-sm transition-all";
  const inactiveButton =
    "flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 transition-all";

  const registerActions = {
    BUYER: registerBuyer,
    SELLER: registerSeller,
    PROVIDER: registerProvider,
  };

  const handleRegisterSubmit = async (formData) => {
    const registerFn = registerActions[role];
    if (!registerFn) {
      throw new Error("Không xác định được loại tài khoản.");
    }
    await registerFn(formData);
    setOtpData({
      email: formData?.email || "",
      password: formData?.password || "",
    });
    setShowOtp(true);
  };

  const handleCloseOtp = () => {
    setShowOtp(false);
    setOtpData(null);
  };

  const handleOtpSuccess = () => {
    setShowOtp(false);
    setOtpData(null);
  };

  return (
    <div className="bg-gray-50 text-gray-900 font-sans antialiased">
      <div className="min-h-screen flex">
        <div className="hidden lg:flex w-1/2 bg-gray-900 relative flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="#F4C02A" />
            </svg>
          </div>

          <div className="relative z-10">
            <h1 className="text-white text-3xl font-extrabold tracking-tight">
              CABIN
            </h1>
          </div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl text-white font-bold leading-tight mb-6">
              Connect globally.<br />
              Trade seamlessly.<br />
              <span className="text-primary-yellow">Deliver reliably.</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Join the ecosystem connecting Buyers, Sellers, and Service Providers in one unified logistics platform.
            </p>
          </div>

          <div className="relative z-10 text-gray-500 text-sm">
            &copy; 2025 Cabin Platform Inc.
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 lg:px-20 bg-white overflow-y-auto">
          <div className="lg:hidden mb-8">
            <h1 className="text-gray-900 text-3xl font-extrabold">CABIN</h1>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
              <a
                href="/login"
                className="text-sm font-semibold text-primary-black hover:underline"
              >
                Log in instead
              </a>
            </div>
            <p className="text-gray-500">Select your role to get started.</p>
          </div>

          <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
            <button
              type="button"
              className={role === "BUYER" ? activeButton : inactiveButton}
              onClick={() => setRole("BUYER")}
            >
              Buyer
            </button>
            <button
              type="button"
              className={role === "SELLER" ? activeButton : inactiveButton}
              onClick={() => setRole("SELLER")}
            >
              Seller
            </button>
            <button
              type="button"
              className={role === "PROVIDER" ? activeButton : inactiveButton}
              onClick={() => setRole("PROVIDER")}
            >
              Provider
            </button>
          </div>

          {role === "BUYER" && <BuyerRegisterForm onSubmit={handleRegisterSubmit} />}
          {role === "SELLER" && <SellerRegisterForm onSubmit={handleRegisterSubmit} />}
          {role === "PROVIDER" && (
            <ProviderRegisterForm onSubmit={handleRegisterSubmit} />
          )}

          <p className="mt-8 text-center text-xs text-gray-400">
            By clicking Register, you agree to our {" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and {" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <OtpModal
        open={showOtp}
        email={otpData?.email}
        password={otpData?.password}
        onClose={handleCloseOtp}
        onSuccess={handleOtpSuccess}
      />
    </div>
  );
};

export default RegisterPage;
