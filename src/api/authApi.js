import httpClient, { API_BASE_URL } from "./httpClient";

const extractErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail[0]?.msg) {
    return detail[0].msg;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

const buildError = (error, fallback) => {
  const err = new Error(extractErrorMessage(error, fallback));
  err.raw = error?.response?.data;
  return err;
};

export const login = async ({ email, password }) => {
  try {
    const res = await httpClient.post("/auth/login", { email, password });
    return res.data;
  } catch (error) {
    throw buildError(
      error,
      "Login failed. Please check your credentials and try again."
    );
  }
};

export const registerBuyer = async (data) => {
  try {
    const res = await httpClient.post("/auth/register/buyer", data);
    return res.data;
  } catch (error) {
    throw buildError(
      error,
      "Unable to create buyer account. Please verify your details and try again."
    );
  }
};

export const registerSeller = async (data) => {
  try {
    const res = await httpClient.post("/auth/register/seller", data);
    return res.data;
  } catch (error) {
    throw buildError(
      error,
      "Unable to create seller account. Please verify your details and try again."
    );
  }
};

export const registerProvider = async (data) => {
  try {
    const res = await httpClient.post("/auth/register/provider", data);
    return res.data;
  } catch (error) {
    throw buildError(
      error,
      "Unable to create provider account. Please verify your details and try again."
    );
  }
};

export { API_BASE_URL };
