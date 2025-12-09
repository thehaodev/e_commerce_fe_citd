import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { getCurrentUser, login as loginApi } from "../api/authApi";

export const getRedirectPathForRole = (role) => {
  switch (role) {
    case "BUYER":
      return "/buyer/home";
    case "SELLER":
      return "/seller/home";
    case "PROVIDER":
      return "/provider/home";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
};

const useAuth = () => {
  const {
    user,
    accessToken,
    isLoggedIn,
    authInitialized,
    setAuth,
    logout: clearAuth,
  } = useAuthStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(
    async (credentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await loginApi(credentials);
        const token =
          data?.access_token || data?.accessToken || data?.token || null;

        if (!token) {
          throw new Error("Access token is missing from login response.");
        }

        window.localStorage.setItem("accessToken", token);
        useAuthStore.setState((prev) => ({
          ...prev,
          accessToken: token,
          isLoggedIn: true,
        }));
        const me = await getCurrentUser();

        setAuth({ user: me, accessToken: token });

        return { user: me, accessToken: token };
      } catch (err) {
        setError(err);
        clearAuth();
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth, clearAuth]
  );

  const initAuth = useCallback(async () => {
    const token =
      useAuthStore.getState().accessToken || window.localStorage.getItem("accessToken");

    if (!token) {
      useAuthStore.setState((prev) => ({ ...prev, authInitialized: true }));
      return;
    }

    useAuthStore.setState((prev) => ({
      ...prev,
      accessToken: token,
      isLoggedIn: true,
    }));

    try {
      const me = await getCurrentUser();
      setAuth({ user: me, accessToken: token });
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if (status === 401 || status === 403) {
        clearAuth();
      }
    } finally {
      useAuthStore.setState((prev) => ({ ...prev, authInitialized: true }));
    }
  }, [setAuth, clearAuth]);

  const logout = useCallback(() => {
    clearAuth();
    navigate("/login");
  }, [clearAuth, navigate]);

  const getUser = useCallback(() => user, [user]);

  const clearError = useCallback(() => setError(null), []);

  return {
    login,
    logout,
    initAuth,
    isLoggedIn,
    isLoading,
    error,
    clearError,
    getUser,
    user,
    accessToken,
    authInitialized,
  };
};

export default useAuth;
