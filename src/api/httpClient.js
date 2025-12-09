import axios from "axios";
import useAuthStore from "../store/authStore";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://e-commerce-be-citd-staging.onrender.com";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  let token = state?.accessToken;

  if (!token) {
    token = window.localStorage.getItem("accessToken");
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      const { logout } = useAuthStore.getState();
      logout?.();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default httpClient;
