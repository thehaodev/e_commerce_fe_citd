import { useCallback, useEffect, useState } from "react";
import { getOffers } from "../api/offerApi";
import { getRequestsByOffer } from "../api/serviceRequestsApi";

const normalizeOffer = (offer) => ({
  id: offer?.id || offer?.offer_id || offer?.offerId || "",
  productName: offer?.product_name || "Offer",
  status: (offer?.status || "").toUpperCase(),
  sellerIncoterm: offer?.seller_incoterm || "",
  portOfLoading: offer?.port_of_loading || "",
  createdAt: offer?.created_at || offer?.createdAt || offer?.updated_at || offer?.updatedAt || "",
});

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

const destinationFor = (request) => {
  const incoterm = (request?.incotermBuyer || "").toUpperCase();
  if (incoterm === "CFR" || incoterm === "CIF") {
    return request?.portOfDischarge || request?.countryCode || "Destination not provided";
  }
  return (
    request?.warehouseAddress ||
    request?.warehouseCode ||
    request?.countryCode ||
    "Destination not provided"
  );
};

const toTimestamp = (value) => {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const useProviderServiceRequests = ({ offerLimit = 10 } = {}) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const offersRes = await getOffers();
      const offerPayload = offersRes?.data ?? offersRes ?? [];
      const offersList = Array.isArray(offerPayload?.data) ? offerPayload.data : offerPayload;
      const activeOffers = offersList.filter((offer) => {
        const status = (offer?.status || "").toUpperCase();
        return status === "ACTIVE" || status === "OPEN";
      });
      const sortedOffers = [...activeOffers].sort(
        (a, b) => toTimestamp(b?.updated_at || b?.created_at) - toTimestamp(a?.updated_at || a?.created_at)
      );
      const limitedOffers =
        offerLimit && offerLimit > 0 ? sortedOffers.slice(0, offerLimit) : sortedOffers;

      if (limitedOffers.length === 0) {
        setRequests([]);
        setIsLoading(false);
        return;
      }

      const bucketed = await Promise.all(
        limitedOffers.map(async (offer) => {
          const offerId = offer?.id || offer?.offer_id || offer?.offerId;
          if (!offerId) return [];
          const res = await getRequestsByOffer(offerId);
          const payload = res?.data ?? res ?? [];
          const list = Array.isArray(payload?.data) ? payload.data : payload;
          return list.map((req) => ({ request: req, offer }));
        })
      );

      const flattened = bucketed
        .flat()
        .map(({ request, offer }) => {
          const normalizedOffer = normalizeOffer(offer);
          const normalizedRequest = normalizeServiceRequest(request);
          return {
            ...normalizedRequest,
            offer: normalizedOffer,
            offerCode: normalizedOffer.id ? `#${normalizedOffer.id}` : "Offer",
            offerProductName: normalizedOffer.productName,
            destination: destinationFor(normalizedRequest),
          };
        })
        .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));

      setRequests(flattened);
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "Could not load service requests.";
      setError(message);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [offerLimit]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    isLoading,
    error,
    refresh: fetchRequests,
  };
};

export default useProviderServiceRequests;
