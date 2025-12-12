import httpClient from "./httpClient";

const unwrap = (response) => response?.data ?? response;

/**
 * Private Offer schema (PrivateOfferResponse):
 * id, offer_id, service_request_id, provider_id,
 * negotiated_price, updated_crd, updated_etd,
 * seller_documentation, internal_notes, status,
 * created_at, updated_at.
 */

export const fetchMyPrivateOffers = async () => {
  const res = await httpClient.get("/private-offer/my");
  return unwrap(res);
};

export const getPrivateOfferById = async (privateOfferId) => {
  const res = await httpClient.get(`/private-offer/${privateOfferId}`);
  return unwrap(res);
};

export const getPrivateOffersByOffer = async (offerId) => {
  const res = await httpClient.get(`/private-offer/offer/${offerId}`);
  return unwrap(res);
};

export const createPrivateOffer = async (offerId, serviceRequestId, payload) => {
  const res = await httpClient.post(
    `/private-offer/${offerId}/service-request/${serviceRequestId}`,
    payload
  );
  return unwrap(res);
};
