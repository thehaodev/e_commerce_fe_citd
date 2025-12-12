import httpClient from "./httpClient";
import { getMyServiceRequests, getServiceRequestById } from "./serviceRequestsApi";

// Private offers created by the current provider
export const getMyPrivateOffers = () => httpClient.get("/private-offer/my");

// Proposals created by the current provider
export const getMyProposals = () => httpClient.get("/proposal/my");

// Service requests visible to the current provider (GET /service-request/my)
export const getProviderServiceRequests = () => getMyServiceRequests();

// Detail for a single service request (GET /service-request/{service_request_id})
export const getServiceRequestDetail = (serviceRequestId) => getServiceRequestById(serviceRequestId);
