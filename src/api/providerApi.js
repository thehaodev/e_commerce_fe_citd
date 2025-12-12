import httpClient from "./httpClient";

// Private offers created by the current provider
export const getMyPrivateOffers = () => httpClient.get("/private-offer/my");

// Proposals created by the current provider
export const getMyProposals = () => httpClient.get("/proposal/my");

// Detail for a single service request (GET /service-request/{service_request_id})
// Kept for contexts where provider already knows a request ID (e.g., via private offer).
export const getServiceRequestDetail = (serviceRequestId) =>
  httpClient.get(`/service-request/${serviceRequestId}`);
