import { useCallback, useState } from "react";
import useAuthStore from "../store/authStore";
import { login as loginApi } from "../api/authApi";

export const getRedirectPathForRole = (role) => {
  switch (role) {
    case "BUYER":
      return "/buyer/home";
    case "SELLER":
      return "/seller/home";
    case "PROVIDER":
      return "/";
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
    setToken,
    setUser,
    logout: clearAuth,
    loadFromLocalStorage,
  } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(
    async (credentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await loginApi(credentials);
        const token = data?.access_token || data?.token || null;
        const nextUser = data?.user || null;

        setToken(token);
        setUser(nextUser);

        return {
          ...data,
          user: nextUser,
          accessToken: token,
        };
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setToken, setUser]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const getUser = useCallback(() => user, [user]);

  const clearError = useCallback(() => setError(null), []);

  return {
    login,
    logout,
    isLoggedIn,
    isLoading,
    error,
    clearError,
    getUser,
    user,
    accessToken,
    loadFromLocalStorage,
  };
};

export default useAuth;
