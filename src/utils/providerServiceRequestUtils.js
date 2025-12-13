import { getAvailableServiceRequests, getRequestsByOffer } from "../api/serviceRequestsApi";

let providerServiceRequestCache = [];

export const normalizeProviderServiceRequest = (item = {}) => ({
  id: item?.id || "",
  offerId: item?.offer_id || item?.offerId || "",
  buyerId: item?.buyer_id || item?.buyerId || "",
  incotermBuyer: (item?.incoterm_buyer || item?.incotermBuyer || "").toString().toUpperCase(),
  note: item?.note || "",
  status: item?.status || "",
  portOfDischarge: item?.port_of_discharge || item?.portOfDischarge || "",
  countryCode: item?.country_code || item?.countryCode || "",
  insuranceType: item?.insurance_type || item?.insuranceType || "",
  warehouseAddress: item?.warehouse_address || item?.warehouseAddress || "",
  warehouseCode: item?.warehouse_code || item?.warehouseCode || "",
  contactName: item?.contact_name || item?.contactName || "",
  contactPhone: item?.contact_phone || item?.contactPhone || "",
  contactEmail: item?.contact_email || item?.contactEmail || "",
  createdAt: item?.created_at || item?.createdAt || "",
  updatedAt: item?.updated_at || item?.updatedAt || "",
});

export const destinationForServiceRequest = (request = {}) =>
  request?.portOfDischarge ||
  request?.warehouseAddress ||
  request?.countryCode ||
  request?.warehouseCode ||
  "Not provided";

export const setProviderServiceRequestCache = (list = []) => {
  providerServiceRequestCache = Array.isArray(list) ? [...list] : [];
};

export const upsertProviderServiceRequests = (list = []) => {
  if (!Array.isArray(list)) return;
  const map = {};
  providerServiceRequestCache.forEach((item) => {
    if (item?.id) {
      map[item.id] = item;
    }
  });
  list.forEach((item) => {
    if (item?.id) {
      map[item.id] = item;
    }
  });
  providerServiceRequestCache = Object.values(map);
};

export const getCachedProviderServiceRequest = (serviceRequestId) =>
  providerServiceRequestCache.find((sr) => `${sr.id}` === `${serviceRequestId}`);

export const getCachedProviderServiceRequests = () => providerServiceRequestCache;

export const fetchProviderServiceRequestById = async ({
  serviceRequestId,
  offerId,
  limit = 100,
  offset = 0,
} = {}) => {
  if (!serviceRequestId) return null;

  const cached = getCachedProviderServiceRequest(serviceRequestId);
  if (cached) return cached;

  let availableError = null;

  try {
    const res = await getAvailableServiceRequests({ limit, offset });
    const payload = res?.data ?? res ?? [];
    const list = Array.isArray(payload?.data) ? payload.data : payload;
    const normalized = (Array.isArray(list) ? list : []).map(normalizeProviderServiceRequest);
    if (normalized.length) {
      upsertProviderServiceRequests(normalized);
    }
    const found = getCachedProviderServiceRequest(serviceRequestId);
    if (found) return found;
  } catch (err) {
    availableError = err;
  }

  if (offerId) {
    try {
      const res = await getRequestsByOffer(offerId);
      const payload = res?.data ?? res ?? [];
      const list = Array.isArray(payload?.data) ? payload.data : payload;
      const normalized = (Array.isArray(list) ? list : []).map(normalizeProviderServiceRequest);
      if (normalized.length) {
        upsertProviderServiceRequests(normalized);
      }
      const found = getCachedProviderServiceRequest(serviceRequestId);
      if (found) return found;
    } catch (err) {
      if (!availableError) {
        availableError = err;
      }
    }
  }

  if (
    availableError &&
    (availableError?.response?.status === 401 || availableError?.response?.status === 403)
  ) {
    throw availableError;
  }

  return null;
};
