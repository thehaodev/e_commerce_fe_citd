import httpClient from "./httpClient";

const unwrap = (response) => response?.data ?? response;

/**
 * Shape based on ServiceRequestResponse from OpenAPI:
 * id, offer_id, buyer_id, incoterm_buyer (CFR/CIF/DAP/DDP), note, status,
 * port_of_discharge, country_code, insurance_type, warehouse_code, warehouse_address,
 * contact_name, contact_phone, contact_email, created_at, updated_at.
 */

export const getMyServiceRequests = async () => {
  const res = await httpClient.get("/service-request/my");
  return unwrap(res);
};

export const createServiceRequest = async (offerId, payload) => {
  const res = await httpClient.post(`/service-request/${offerId}`, payload);
  return unwrap(res);
};

export const getServiceRequestById = async (serviceRequestId) => {
  const res = await httpClient.get(`/service-request/${serviceRequestId}`);
  return unwrap(res);
};

export const getRequestsByOffer = async (offerId) => {
  const res = await httpClient.get(`/service-request/offer/${offerId}`);
  return unwrap(res);
};

/**
 * Provider-facing list of available service requests.
 * Defaults to limit=50 and offset=0.
 */
export const getAvailableServiceRequests = async (params = {}) => {
  const { limit = 50, offset = 0 } = params;
  const res = await httpClient.get("/service-request/available", {
    params: { limit, offset },
  });
  return unwrap(res);
};

// Backwards-compatible alias
export const getServiceRequestsByOffer = getRequestsByOffer;
