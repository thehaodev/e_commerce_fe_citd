import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  user: null,
  accessToken: null,
  isLoggedIn: false,
  authInitialized: false,
};

const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,
      setAuth: ({ user, accessToken }) =>
        set(() => {
          if (accessToken) {
            window.localStorage.setItem("accessToken", accessToken);
          } else {
            window.localStorage.removeItem("accessToken");
          }

          return {
            user: user || null,
            accessToken: accessToken || null,
            isLoggedIn: Boolean(accessToken || user),
            authInitialized: true,
          };
        }),
      logout: () =>
        set(() => {
          window.localStorage.removeItem("accessToken");
          return { ...initialState, authInitialized: true };
        }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;
