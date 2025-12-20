import httpClient from "./httpClient";

/**
 * @typedef {import("../types/apiSchemas").UserProfileResponse} UserProfileResponse
 * @typedef {import("../types/apiSchemas").UserUpdateSelf} UserUpdateSelf
 */

const unwrap = (response) => response?.data ?? response;

export const userApi = {
  /**
   * Fetch the current authenticated user's profile.
   * @returns {Promise<UserProfileResponse>}
   */
  async getMe() {
    const res = await httpClient.get("/users/me");
    return unwrap(res);
  },

  /**
   * Update the current authenticated user's editable fields.
   * @param {UserUpdateSelf} payload
   * @returns {Promise<UserProfileResponse>}
   */
  async updateMe(payload = {}) {
    const body = {
      full_name:
        payload.full_name === undefined || payload.full_name === "" ? null : payload.full_name,
      phone: payload.phone === undefined || payload.phone === "" ? null : payload.phone,
      company_name:
        payload.company_name === undefined || payload.company_name === ""
          ? null
          : payload.company_name,
      avatar_url:
        payload.avatar_url === undefined || payload.avatar_url === "" ? null : payload.avatar_url,
    };

    const res = await httpClient.patch("/users/me", body);
    return unwrap(res);
  },
};

export const getMe = (...args) => userApi.getMe(...args);
export const updateMe = (...args) => userApi.updateMe(...args);

export default userApi;
