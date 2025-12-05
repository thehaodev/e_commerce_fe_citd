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
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default httpClient;
