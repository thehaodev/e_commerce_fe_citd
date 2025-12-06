import httpClient from "./httpClient";

export const getOffers = () => httpClient.get("/offers");

export const getOfferById = (offerId) => httpClient.get(`/offers/${offerId}`);

export const createOffer = async (payload) => {
  const formData = new FormData();

  formData.append("product_name", payload.product_name || "");
  if (payload.description) formData.append("description", payload.description);
  formData.append("quantity", payload.quantity);
  formData.append("price", payload.price);
  formData.append("seller_incoterm", payload.seller_incoterm);
  formData.append("port_of_loading", payload.port_of_loading || "");
  formData.append("cargo_ready_date", payload.cargo_ready_date || "");
  if (payload.payment_terms) formData.append("payment_terms", payload.payment_terms);

  const images = Array.isArray(payload.images) ? payload.images : [];
  images.forEach((image) => {
    if (image instanceof File || image?.file instanceof File) {
      formData.append("images", image instanceof File ? image : image.file);
    }
  });

  const response = await httpClient.post("/offers", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getMyOffers = async (params = {}) => {
  const response = await httpClient.get("/offers/my", { params });
  return response.data;
};
