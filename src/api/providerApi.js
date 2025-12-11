import httpClient from "./httpClient";

// Private offers created by the current provider
export const getMyPrivateOffers = () => httpClient.get("/private-offer/my");

// Proposals created by the current provider
export const getMyProposals = () => httpClient.get("/proposal/my");

// Service requests visible to the current provider
export const getProviderServiceRequests = () => httpClient.get("/service-request/provider");

// Detail for a single service request
export const getServiceRequestDetail = (serviceRequestId) =>
  httpClient.get(`/service-request/${serviceRequestId}`);
