import httpClient from "./httpClient";
import { fetchProviderServiceRequestById } from "../utils/providerServiceRequestUtils";

// Private offers created by the current provider
export const getMyPrivateOffers = () => httpClient.get("/private-offer/my");

// Proposals created by the current provider
export const getMyProposals = () => httpClient.get("/proposal/my");

// Provider-safe detail lookup (does NOT call /service-request/{id})
export const getServiceRequestDetail = (serviceRequestId, offerId) =>
  fetchProviderServiceRequestById({ serviceRequestId, offerId, limit: 200, offset: 0 });
