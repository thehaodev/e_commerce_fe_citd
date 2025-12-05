import httpClient, { API_BASE_URL } from "./httpClient";
import mapBackendErrors from "../utils/mapBackendErrors";

const extractErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
};

const buildError = (error, fallback) => {
  const err = new Error(extractErrorMessage(error, fallback));
  err.status = error?.response?.status;
  err.raw = error?.response?.data;
  err.fields = mapBackendErrors(error);
  return err;
};

const post = async (url, payload, fallback) => {
  try {
    const res = await httpClient.post(url, payload);
    return res.data;
  } catch (error) {
    throw buildError(error, fallback);
  }
};

const get = async (url, fallback) => {
  try {
    const res = await httpClient.get(url);
    return res.data;
  } catch (error) {
    throw buildError(error, fallback);
  }
};

export const registerBuyer = async (data) =>
  post(
    "/auth/register/buyer",
    data,
    "Unable to create buyer account. Please verify your details and try again."
  );

export const registerSeller = async (data) =>
  post(
    "/auth/register/seller",
    data,
    "Unable to create seller account. Please verify your details and try again."
  );

export const registerProvider = async (data) =>
  post(
    "/auth/register/provider",
    data,
    "Unable to create provider account. Please verify your details and try again."
  );

export const verifyOtp = async (data) =>
  post(
    "/auth/verify-otp",
    data,
    "OTP verification failed. Please check your code and try again."
  );

export const login = async (data) =>
  post("/auth/login", data, "Login failed. Please check your credentials.");

export const getCurrentUser = async () =>
  get("/auth/me", "Unable to fetch your profile. Please try again.");

export const forgotPassword = async (data) =>
  post(
    "/auth/forgot-password",
    data,
    "Unable to send OTP. Please verify your email and try again."
  );

export const resetPassword = async (data) =>
  post(
    "/auth/reset-password",
    data,
    "Unable to reset password. Please check the OTP code and try again."
  );

export { API_BASE_URL };
