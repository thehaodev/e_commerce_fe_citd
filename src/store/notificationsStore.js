import { create } from "zustand";
import {
  listMy as listMyNotifications,
  markRead as markNotificationsRead,
  unreadCount as fetchUnreadCount,
} from "../api/notificationsApi";

const initialState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  isWsConnected: false,
};

const useNotificationsStore = create((set, get) => ({
  ...initialState,

  setWsConnected: (isConnected) =>
    set((state) => (state.isWsConnected === isConnected ? state : { ...state, isWsConnected: isConnected })),

  loadList: async (limit = 50, offset = 0) => {
    set({ isLoading: true });
    try {
      const data = await listMyNotifications({ limit, offset });
      const items = Array.isArray(data) ? data : [];
      const unreadFromList = items.filter((n) => !n?.is_read).length;
      set((state) => ({
        items,
        isLoading: false,
        unreadCount: Math.max(state.unreadCount, unreadFromList),
      }));
      return items;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshUnreadCount: async () => {
    try {
      const res = await fetchUnreadCount();
      const unread = Number(res?.unread_count) || 0;
      set((state) => (state.unreadCount === unread ? state : { ...state, unreadCount: unread }));
      return unread;
    } catch (error) {
      return get().unreadCount;
    }
  },

  markAsRead: async (ids = []) => {
    if (!Array.isArray(ids) || ids.length === 0) return;

    const state = get();
    const itemsBefore = state.items;
    const unreadBefore = state.unreadCount;
    const unreadIds = ids.filter((id) => {
      const item = itemsBefore.find((n) => n.id === id);
      return item && !item.is_read;
    });

    if (unreadIds.length === 0) {
      try {
        await markNotificationsRead(ids);
      } catch (error) {
        // no-op if already read locally
      }
      return;
    }

    const updatedItems = itemsBefore.map((item) =>
      unreadIds.includes(item.id) ? { ...item, is_read: true } : item
    );

    set({
      items: updatedItems,
      unreadCount: Math.max(0, unreadBefore - unreadIds.length),
    });

    try {
      await markNotificationsRead(unreadIds);
    } catch (error) {
      set({
        items: itemsBefore,
        unreadCount: unreadBefore,
      });
      throw error;
    }
  },

  pushRealtime: (notification) =>
    set((state) => {
      if (!notification?.id) return state;
      const existingIndex = state.items.findIndex((n) => n.id === notification.id);
      const shouldIncrement =
        notification.is_read === false &&
        (existingIndex === -1 || state.items[existingIndex]?.is_read);

      const items =
        existingIndex === -1
          ? [notification, ...state.items]
          : state.items.map((item, idx) =>
              idx === existingIndex ? { ...item, ...notification } : item
            );

      return {
        ...state,
        items,
        unreadCount: shouldIncrement ? state.unreadCount + 1 : state.unreadCount,
      };
    }),

  reset: () => set(initialState),
}));

export default useNotificationsStore;
