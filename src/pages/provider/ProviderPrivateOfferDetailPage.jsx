import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiClock,
  FiFileText,
  FiLayers,
  FiRefreshCw,
  FiTag,
} from "react-icons/fi";
import { privateOfferApi } from "../../api/privateOffersApi";
import { getOfferById } from "../../api/offerApi";
import {
  destinationForServiceRequest,
  fetchProviderServiceRequestById,
  normalizeProviderServiceRequest,
} from "../../utils/providerServiceRequestUtils";

const normalizePrivateOffer = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  serviceRequestId: item?.service_request_id || "",
  providerId: item?.provider_id || "",
  negotiatedPrice: item?.negotiated_price || "",
  updatedCrd: item?.updated_crd || null,
  updatedEtd: item?.updated_etd || null,
  sellerDocumentation: item?.seller_documentation || "",
  internalNotes: item?.internal_notes ?? "",
  status: item?.status || "",
  createdAt: item?.created_at || "",
  updatedAt: item?.updated_at || "",
});

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const StatusBadge = ({ value }) => (
  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
    {value || "PRIVATE_OFFER_CREATED"}
  </span>
);

const ProviderPrivateOfferDetailPage = () => {
  const { privateOfferId } = useParams();
  const navigate = useNavigate();

  const [privateOffer, setPrivateOffer] = useState(null);
  const [offer, setOffer] = useState(null);
  const [serviceRequest, setServiceRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    if (!privateOfferId) {
      setError("Private offer not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await privateOfferApi.getPrivateOfferById(privateOfferId);
      const data = normalizePrivateOffer(res?.data ?? res);
      setPrivateOffer(data);

      if (data.offerId) {
        try {
          const offerRes = await getOfferById(data.offerId);
          setOffer(offerRes?.data ?? offerRes);
        } catch (err) {
          setOffer(null);
        }
      }

      if (data.serviceRequestId) {
        try {
          const srRes = await fetchProviderServiceRequestById({
            serviceRequestId: data.serviceRequestId,
            offerId: data.offerId,
            limit: 200,
            offset: 0,
          });
          setServiceRequest(srRes ? normalizeProviderServiceRequest(srRes) : null);
        } catch (err) {
          if (!error && (err?.response?.status === 401 || err?.response?.status === 403)) {
            setError("You are not allowed");
          }
          setServiceRequest(null);
        }
      }
    } catch (err) {
      const msg =
        err?.response?.status === 401 || err?.response?.status === 403
          ? "You are not allowed"
          : err?.response?.data?.detail ||
            err?.message ||
            "Private offer not found or you are not allowed to view it.";
      setError(msg);
      setPrivateOffer(null);
      setOffer(null);
      setServiceRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateOfferId]);

  const offerLabel = useMemo(() => {
    if (!offer) return "Offer";
    return offer.product_name || `Offer ${offer.id || ""}` || "Offer";
  }, [offer]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/provider/service-requests")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Service Requests
        </button>
        <button
          type="button"
          onClick={() => navigate("/provider/private-offers")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Private Offers
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Private Offer Detail
        </span>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 mb-3" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200 mb-6" />
          <div className="grid gap-3 lg:grid-cols-3">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="h-28 rounded-xl border border-slate-100 bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <FiAlertCircle className="mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Private offer not found or inaccessible.</p>
            <p className="text-xs text-rose-600">{error}</p>
            <button
              type="button"
              onClick={fetchDetail}
              className="text-xs font-semibold text-rose-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Private Offer
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                {privateOffer?.id ? `#PO-${privateOffer.id}` : "Private Offer"}
              </h1>
              <p className="text-sm text-slate-600">
                Linked to {offerLabel} and service request{" "}
                {privateOffer?.serviceRequestId ? `#${privateOffer.serviceRequestId}` : "N/A"}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge value={privateOffer?.status} />
              <span className="text-xs text-slate-500">
                Created {formatDate(privateOffer?.createdAt)}
              </span>
              <button
                type="button"
                onClick={fetchDetail}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <FiRefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <FiLayers className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg font-bold">Offer summary</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Offer ID" value={offer?.id ? `#${offer.id}` : "Not provided"} />
                  <InfoRow label="Product" value={offer?.product_name} />
                  <InfoRow label="Quantity" value={offer?.quantity} />
                  <InfoRow label="Seller incoterm" value={offer?.seller_incoterm} />
                  <InfoRow label="Port of Loading" value={offer?.port_of_loading} />
                  <InfoRow label="Cargo Ready Date" value={formatDate(offer?.cargo_ready_date)} />
                  <InfoRow label="Price" value={offer?.price} />
                  <InfoRow label="Payment terms" value={offer?.payment_terms} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <FiClock className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg font-bold">Service Request details</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    label="Buyer Incoterm"
                    value={(serviceRequest?.incotermBuyer || "").toString().toUpperCase()}
                  />
                  <InfoRow
                    label="Destination"
                    value={destinationForServiceRequest(serviceRequest)}
                  />
                  <InfoRow label="Insurance Type" value={serviceRequest?.insuranceType} />
                  <InfoRow label="Status" value={serviceRequest?.status || "REQUESTED"} />
                  <InfoRow label="Buyer ID" value={serviceRequest?.buyerId} />
                  <InfoRow label="Offer ID" value={serviceRequest?.offerId} />
                  <InfoRow label="Created" value={formatDate(serviceRequest?.createdAt)} />
                  <InfoRow label="Updated" value={formatDate(serviceRequest?.updatedAt)} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Buyer notes
                  </p>
                  <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                    {serviceRequest?.note || "No additional notes provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <FiFileText className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-bold">Private Offer</h3>
                </div>
                <InfoRow label="Private Offer ID" value={privateOffer?.id ? `#PO-${privateOffer.id}` : "N/A"} />
                <InfoRow label="Negotiated price" value={privateOffer?.negotiatedPrice} />
                <InfoRow label="Updated CRD" value={formatDate(privateOffer?.updatedCrd)} />
                <InfoRow label="Updated ETD" value={formatDate(privateOffer?.updatedEtd)} />
                <InfoRow label="Status" value={privateOffer?.status || "PRIVATE_OFFER_CREATED"} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Seller documentation
                  </p>
                  <p className="rounded-xl border border-emerald-100 bg-white px-3 py-3 text-sm text-slate-800">
                    {privateOffer?.sellerDocumentation || "No documentation provided."}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Internal notes
                  </p>
                  <p className="rounded-xl border border-emerald-100 bg-white px-3 py-3 text-sm text-slate-800">
                    {privateOffer?.internalNotes || "No internal notes."}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!privateOffer?.id}
                  onClick={() =>
                    privateOffer?.id &&
                    navigate(`/provider/proposals/new?privateOfferId=${privateOffer.id}`, {
                      state: { privateOffer, serviceRequest, offer },
                    })
                  }
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    privateOffer?.id
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Send Proposal
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Navigate
                </h3>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/provider/service-requests")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                  >
                    Back to Service Requests
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/provider/private-offers")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Back to My Private Offers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-slate-900 text-right break-all">{value || "Not provided"}</p>
  </div>
);

export default ProviderPrivateOfferDetailPage;
