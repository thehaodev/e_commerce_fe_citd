import httpClient from "./httpClient";

export const getMyBuyerInterests = () => httpClient.get("/buyer-interest/my");

export const createBuyerInterest = (offerId) => httpClient.post(`/buyer-interest/${offerId}`);

export const checkBuyerInterest = async (offerId) => {
  const res = await httpClient.get("/buyer-interest/check", {
    params: { offer_id: offerId },
  });
  const payload = res?.data ?? res;
  const interested =
    payload === true ||
    Boolean(
      payload?.interested ||
        payload?.is_interested ||
        payload?.exists ||
        payload?.has_interest ||
        payload?.interest ||
        payload?.id ||
        payload?.interest_id
    );
  return { interested, data: payload };
};
