import { useCallback, useState } from "react";
import useAuthStore from "../store/authStore";
import { getCurrentUser, login as loginApi } from "../api/authApi";

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
        const token = data?.access_token || data?.token || null;

        // Store token first so /auth/me can use it
        setAuth({
          user: data?.user || null,
          accessToken: token,
        });

        const profile = await getCurrentUser();
        const resolvedUser = profile?.user || profile || null;

        setAuth({
          user: resolvedUser,
          accessToken: token,
        });

        return {
          ...data,
          user: resolvedUser,
          accessToken: token,
        };
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
