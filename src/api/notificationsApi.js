import httpClient from "./httpClient";

const unwrap = (response) => response?.data ?? response;

export const listMy = async (params = {}) => {
  const { limit = 50, offset = 0 } = params || {};
  const res = await httpClient.get("/notifications/my", {
    params: { limit, offset },
  });
  return unwrap(res);
};

export const unreadCount = async () => {
  const res = await httpClient.get("/notifications/unread-count");
  return unwrap(res);
};

export const markRead = async (ids = []) => {
  const res = await httpClient.post("/notifications/mark-read", { ids });
  return unwrap(res);
};

export default {
  listMy,
  unreadCount,
  markRead,
};
