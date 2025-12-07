import httpClient from "./httpClient";

export const createOffer = (data) => httpClient.post("/offers", data);

export const getMyOffers = () => httpClient.get("/offers/my");

export const getOfferById = (offerId) => httpClient.get(`/offers/${offerId}`);

// Keep the generic list for potential buyer/provider flows
export const getOffers = () => httpClient.get("/offers");
