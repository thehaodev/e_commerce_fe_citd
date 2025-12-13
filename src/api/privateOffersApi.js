import httpClient from "./httpClient";

/**
 * @typedef {import("../types/apiSchemas").PrivateOfferResponse} PrivateOfferResponse
 * @typedef {import("../types/apiSchemas").PrivateOfferCreatePayload} PrivateOfferCreatePayload
 */

const unwrap = (response) => response?.data ?? response;

/**
 * Private offer API surface for provider flows.
 */
export const privateOfferApi = {
  /**
   * Fetches the current provider's private offers.
   * @returns {Promise<PrivateOfferResponse[] | { data: PrivateOfferResponse[] }>}
   */
  async getMyPrivateOffers() {
    const res = await httpClient.get("/private-offer/my");
    return unwrap(res);
  },

  /**
   * Fetches detail for a single private offer.
   * @param {string | number} privateOfferId
   * @returns {Promise<PrivateOfferResponse>}
   */
  async getPrivateOfferById(privateOfferId) {
    const res = await httpClient.get(`/private-offer/${privateOfferId}`);
    return unwrap(res);
  },

  /**
   * Fetches private offers linked to a specific offer.
   * @param {string | number} offerId
   * @returns {Promise<PrivateOfferResponse[] | { data: PrivateOfferResponse[] }>}
   */
  async getPrivateOffersByOffer(offerId) {
    const res = await httpClient.get(`/private-offer/offer/${offerId}`);
    return unwrap(res);
  },

  /**
   * Creates a private offer for a given offer + service request pair.
   * @param {string | number} offerId
   * @param {string | number} serviceRequestId
   * @param {PrivateOfferCreatePayload} payload
   * @returns {Promise<PrivateOfferResponse>}
   */
  async createPrivateOffer(offerId, serviceRequestId, payload) {
    const res = await httpClient.post(
      `/private-offer/${offerId}/service-request/${serviceRequestId}`,
      payload
    );
    return unwrap(res);
  },
};

// Backwards-compatible named exports
export const getMyPrivateOffers = (...args) => privateOfferApi.getMyPrivateOffers(...args);
export const getPrivateOfferById = (...args) => privateOfferApi.getPrivateOfferById(...args);
export const getPrivateOffersByOffer = (...args) =>
  privateOfferApi.getPrivateOffersByOffer(...args);
export const createPrivateOffer = (...args) => privateOfferApi.createPrivateOffer(...args);

export default privateOfferApi;
