import httpClient from "./httpClient";

const unwrap = (response) => response?.data ?? response;

/**
 * Provider proposal API surface.
 * Path reference:
 * - POST /proposal/private-offer/{private_offer_id}
 * - GET /proposal/my
 * - GET /proposal/{proposal_id}
 * - POST /proposal/{proposal_id}/withdraw
 */
export const proposalApi = {
  /**
   * Create a proposal for a private offer.
   * @param {string | number} privateOfferId
   * @param {object} payload
   */
  async createProposal(privateOfferId, payload) {
    const res = await httpClient.post(`/proposal/private-offer/${privateOfferId}`, payload);
    return unwrap(res);
  },

 async getMyProposals() {
    const res = await httpClient.get("/proposal/my");
    return unwrap(res);
  },

  async listProposalsForOffer(offerId) {
    const res = await httpClient.get(`/proposal/offer/${offerId}`);
    return unwrap(res);
  },

  async awardProposal(proposalId) {
    const res = await httpClient.post(`/proposal/${proposalId}/award`);
    return unwrap(res);
  },

  // Keep the optional single fetch if needed elsewhere.
  async getProposalById(proposalId) {
    const res = await httpClient.get(`/proposal/${proposalId}`);
    return unwrap(res);
  },

  async withdrawProposal(proposalId) {
    const res = await httpClient.post(`/proposal/${proposalId}/withdraw`);
    return unwrap(res);
  },
};

// Backwards-compatible named exports
export const createProposal = (...args) => proposalApi.createProposal(...args);
export const createProposalForPrivateOffer = (...args) =>
  proposalApi.createProposal(...args);
export const getMyProposals = (...args) => proposalApi.getMyProposals(...args);
export const listProposalsForOffer = (...args) => proposalApi.listProposalsForOffer(...args);
export const awardProposal = (...args) => proposalApi.awardProposal(...args);
export const getProposalById = (...args) => proposalApi.getProposalById(...args);
export const withdrawProposal = (...args) => proposalApi.withdrawProposal(...args);

export default proposalApi;
