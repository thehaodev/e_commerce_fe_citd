import httpClient from "./httpClient";

const unwrap = (response) => response?.data ?? response;

export const getMyProposals = async () => {
  const res = await httpClient.get("/proposal/my");
  return unwrap(res);
};

export const getProposalById = async (proposalId) => {
  const res = await httpClient.get(`/proposal/${proposalId}`);
  return unwrap(res);
};

export const withdrawProposal = async (proposalId) => {
  const res = await httpClient.post(`/proposal/${proposalId}/withdraw`);
  return unwrap(res);
};

export const createProposalForPrivateOffer = async (privateOfferId, payload) => {
  const res = await httpClient.post(`/proposal/private-offer/${privateOfferId}`, payload);
  return unwrap(res);
};
