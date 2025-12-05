import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      login: ({ user, accessToken }) => {
        set({
          user: user || null,
          accessToken: accessToken || null,
          isLoggedIn: Boolean(accessToken || user),
        });
      },
      setToken: (accessToken) => {
        set((state) => ({
          accessToken: accessToken || null,
          isLoggedIn: Boolean(accessToken || state.user),
        }));
      },
      setUser: (user) => {
        set((state) => ({
          user: user || null,
          isLoggedIn: Boolean(state.accessToken || user),
        }));
      },
      logout: () => {
        set({
          user: null,
          accessToken: null,
          isLoggedIn: false,
        });
      },
      loadFromLocalStorage: () => {
        try {
          const stored = window.localStorage.getItem("auth-store");
          if (!stored) return;
          const parsed = JSON.parse(stored);
          if (parsed?.state) {
            const { user, accessToken, isLoggedIn } = parsed.state;
            set({
              user: user || null,
              accessToken: accessToken || null,
              isLoggedIn: Boolean(isLoggedIn && (accessToken || user)),
            });
          }
        } catch {
          // ignore malformed storage
        }
      },
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
