import { useCallback, useState } from "react";
import useAuthStore from "../store/authStore";
import { login as loginApi } from "../api/authApi";

const useAuth = () => {
  const {
    user,
    accessToken,
    isLoggedIn,
    login: setAuth,
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
        setAuth({
          user: data?.user || null,
          accessToken: data?.access_token || data?.token || null,
        });
        return data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
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
