import httpClient from "./httpClient";

export const getMyBuyerInterests = () => httpClient.get("/buyer-interest/my");

export const createBuyerInterest = (offerId) =>
  httpClient.post(`/buyer-interest/${offerId}`);
