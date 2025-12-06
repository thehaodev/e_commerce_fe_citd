import httpClient from "./httpClient";

export const getMyBuyerInterests = () => httpClient.get("/buyer-interest/my");
