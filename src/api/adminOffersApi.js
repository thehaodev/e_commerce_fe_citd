import httpClient from "./httpClient";

const unwrap = (response) => response?.data ?? response;

export const getAllOffers = async () => {
  const res = await httpClient.get("/offers");
  return unwrap(res);
};

export const getPendingOffers = async () => {
  const res = await httpClient.get("/offers/pending");
  return unwrap(res);
};

export const approveOffer = async (offerId) => {
  const res = await httpClient.post(`/offers/${offerId}/approve`);
  return unwrap(res);
};

export const lockOffer = async (offerId, payload) => {
  const res = await httpClient.post(`/offers/${offerId}/lock`, payload);
  return unwrap(res);
};

export const deleteOffer = async (offerId) => {
  const res = await httpClient.delete(`/offers/${offerId}`);
  return unwrap(res);
};
