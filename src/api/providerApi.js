import httpClient from "./httpClient";

// Private offers created by the current provider
export const getMyPrivateOffers = () => httpClient.get("/private-offer/my");

// Proposals created by the current provider
export const getMyProposals = () => httpClient.get("/proposal/my");

// TODO: Replace this when BE exposes provider-specific service request endpoint.
// For now, service requests are mocked on the FE.
