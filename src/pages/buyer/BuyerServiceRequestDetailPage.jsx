import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import { getOfferById } from "../../api/offerApi";
import { getServiceRequestById } from "../../api/serviceRequestsApi";

const normalizeServiceRequest = (item) => ({
  id: item?.id || "",
  offerId: item?.offer_id || "",
  buyerId: item?.buyer_id || "",
  incotermBuyer: item?.incoterm_buyer || "",
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
  createdAt: item?.created_at || "",
  updatedAt: item?.updated_at || "",
});

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const destinationFor = (request) => {
  const incoterm = (request?.incotermBuyer || "").toUpperCase();
  if (incoterm === "CFR" || incoterm === "CIF") {
    return request?.portOfDischarge || request?.countryCode || "Not provided";
  }
  return request?.warehouseAddress || request?.warehouseCode || request?.countryCode || "Not provided";
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{label}</p>
    <p className="text-sm font-semibold text-gray-900 text-right">{value || "Not provided"}</p>
  </div>
);

const BuyerServiceRequestDetailPage = () => {
  const { serviceRequestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.success;

  const [serviceRequest, setServiceRequest] = useState(null);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    if (!serviceRequestId) {
      setError("Service request not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getServiceRequestById(serviceRequestId);
      const data = res?.data ?? res;
      const normalized = normalizeServiceRequest(data);
      setServiceRequest(normalized);

      if (normalized.offerId) {
        try {
          const offerRes = await getOfferById(normalized.offerId);
          setOffer(offerRes?.data ?? offerRes);
        } catch (offerErr) {
          console.error("Failed to load offer detail", offerErr);
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Service request not found or you are not allowed to view it.";
      setError(msg);
      setServiceRequest(null);
      setOffer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceRequestId]);

  const offerLabel = useMemo(() => {
    if (!offer) return "Service Request";
    return offer.product_name || `Offer ${offer.id || ""}` || "Service Request";
  }, [offer]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/buyer/service-requests")}
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm hover:border-amber-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Service Requests
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Detail
        </span>
      </div>

      {successMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <FiCheckCircle className="h-4 w-4 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-amber-100 mb-3" />
          <div className="grid gap-3 lg:grid-cols-3">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="h-28 rounded-xl border border-amber-50 bg-amber-50 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <FiAlertCircle className="mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Could not load this service request.</p>
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
        serviceRequest && (
          <>
            <div className="flex flex-col gap-2 rounded-2xl border border-amber-100 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Service Request
                </p>
                <h1 className="text-2xl font-bold text-gray-900">
                  {offerLabel} {serviceRequest?.id ? `(SR ${serviceRequest.id})` : ""}
                </h1>
                <p className="text-sm text-gray-600">
                  Buyer Incoterm: {(serviceRequest?.incotermBuyer || "").toString().toUpperCase()} •
                  Destination: {destinationFor(serviceRequest)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {serviceRequest?.status || "REQUESTED"}
                </span>
                <span className="text-xs text-gray-500">Created {formatDate(serviceRequest?.createdAt)}</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <FiGlobe className="h-5 w-5" />
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

                <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <FiMapPin className="h-5 w-5" />
                    <h2 className="text-lg font-bold">Service Request details</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoRow
                      label="Buyer Incoterm"
                      value={(serviceRequest?.incotermBuyer || "").toString().toUpperCase()}
                    />
                    <InfoRow label="Destination" value={destinationFor(serviceRequest)} />
                    <InfoRow label="Insurance Type" value={serviceRequest?.insuranceType} />
                    <InfoRow label="Status" value={serviceRequest?.status || "REQUESTED"} />
                    <InfoRow label="Buyer ID" value={serviceRequest?.buyerId} />
                    <InfoRow label="Offer ID" value={serviceRequest?.offerId} />
                    <InfoRow label="Created" value={formatDate(serviceRequest?.createdAt)} />
                    <InfoRow label="Updated" value={formatDate(serviceRequest?.updatedAt)} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
                      Buyer notes
                    </p>
                    <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-sm text-gray-800">
                      {serviceRequest?.note || "No additional notes provided."}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <InfoRow label="Contact name" value={serviceRequest?.contactName} />
                    <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                      <FiPhone className="text-amber-600" />
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {serviceRequest?.contactPhone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                      <FiMail className="text-amber-600" />
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-gray-900 break-all">
                          {serviceRequest?.contactEmail || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-emerald-900 mb-2">Next steps</h3>
                  <p className="text-sm text-emerald-800 mb-4">
                    View the related offer or return to your service request list.
                  </p>
                  <div className="space-y-2">
                    {serviceRequest?.offerId && (
                      <button
                        type="button"
                        onClick={() => navigate(`/buyer/offers/${serviceRequest.offerId}`)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        <FiExternalLink className="h-4 w-4" />
                        View Offer
                      </button>
                    )}
                    {serviceRequest?.id && (
                      <button
                        type="button"
                        onClick={() => navigate(`/buyer/service-requests/${serviceRequest.id}/proposals`)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
                      >
                        <FiExternalLink className="h-4 w-4" />
                        View Proposals
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate("/buyer/service-requests")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
                    >
                      Back to My Requests
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default BuyerServiceRequestDetailPage;
