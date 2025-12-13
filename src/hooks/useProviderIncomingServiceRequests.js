import { useCallback, useEffect, useState } from "react";
import { getOfferById } from "../api/offerApi";
import { getAvailableServiceRequests } from "../api/serviceRequestsApi";

const normalizeServiceRequest = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  buyerId: item?.buyer_id || "",
  incotermBuyer: (item?.incoterm_buyer || "").toUpperCase(),
  note: item?.note || "",
  status: item?.status || "",
  portOfDischarge: item?.port_of_discharge || "",
  countryCode: item?.country_code || "",
  insuranceType: item?.insurance_type || "",
  warehouseAddress: item?.warehouse_address || "",
  warehouseCode: item?.warehouse_code || "",
  contactName: item?.contact_name || "",
  contactPhone: item?.contact_phone || "",
  contactEmail: item?.contact_email || "",
  createdAt: item?.created_at || item?.createdAt || "",
  updatedAt: item?.updated_at || item?.updatedAt || "",
});

const destinationFor = (request) =>
  request?.portOfDischarge || request?.warehouseAddress || "—";

const toTimestamp = (value) => {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const useProviderIncomingServiceRequests = ({
  limit = 50,
  offset = 0,
  offerEnrichmentLimit = 10,
} = {}) => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await getAvailableServiceRequests({ limit, offset });
      const payload = res?.data ?? res ?? [];
      const list = Array.isArray(payload?.data) ? payload.data : payload;
      const normalized = (Array.isArray(list) ? list : []).map(normalizeServiceRequest);

      const uniqueOfferIds = [];
      normalized.forEach((sr) => {
        if (sr.offerId && !uniqueOfferIds.includes(sr.offerId)) {
          uniqueOfferIds.push(sr.offerId);
        }
      });
      const limitedOfferIds = uniqueOfferIds.slice(0, offerEnrichmentLimit);

      const offerEntries = await Promise.all(
        limitedOfferIds.map(async (offerId) => {
          try {
            const offerRes = await getOfferById(offerId);
            return [offerId, offerRes?.data ?? offerRes];
          } catch (err) {
            return [offerId, undefined];
          }
        })
      );
      const offerMap = Object.fromEntries(offerEntries);

      const mappedRows = normalized
        .map((serviceRequest) => {
          const offer = serviceRequest.offerId ? offerMap[serviceRequest.offerId] : undefined;
          return {
            id: serviceRequest.id,
            offerId: serviceRequest.offerId,
            incotermBuyer: serviceRequest.incotermBuyer,
            status: serviceRequest.status || "REQUESTED",
            destination: destinationFor(serviceRequest),
            createdDate: serviceRequest.createdAt,
            serviceRequest,
            offer,
            offerCode: serviceRequest.offerId ? `#${serviceRequest.offerId}` : "",
            offerProductName:
              offer?.product_name || offer?.productName || offer?.title || "Offer",
            offerSellerIncoterm: offer?.seller_incoterm || offer?.sellerIncoterm || "",
            contactName: serviceRequest.contactName,
            contactEmail: serviceRequest.contactEmail,
            contactPhone: serviceRequest.contactPhone,
          };
        })
        .sort((a, b) => toTimestamp(b.createdDate) - toTimestamp(a.createdDate));

      setRows(mappedRows);
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "Could not load service requests.";
      setError(message);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, offerEnrichmentLimit]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    rows,
    isLoading,
    error,
    refetch: fetchRequests,
  };
};

export default useProviderIncomingServiceRequests;
