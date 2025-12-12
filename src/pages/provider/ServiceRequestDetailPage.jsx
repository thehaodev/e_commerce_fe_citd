import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiClock,
  FiExternalLink,
  FiLayers,
  FiMail,
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

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
    {children}
  </span>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-slate-900 text-right">{value || "Not provided"}</p>
  </div>
);

const destinationFor = (request) => {
  const incoterm = (request?.incotermBuyer || "").toUpperCase();
  if (incoterm === "CFR" || incoterm === "CIF") {
    return request?.portOfDischarge || request?.countryCode || "Not provided";
  }
  return request?.warehouseAddress || request?.warehouseCode || request?.countryCode || "Not provided";
};

const ServiceRequestDetailPage = () => {
  const { serviceRequestId } = useParams();
  const navigate = useNavigate();
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

  const handleCreatePrivateOffer = () => {
    if (!serviceRequest?.id || !serviceRequest?.offerId) {
      window.alert("Missing service request or offer information for this private offer.");
      return;
    }
    navigate(
      `/provider/private-offers/new?serviceRequestId=${serviceRequest.id}&offerId=${serviceRequest.offerId}`
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/provider/service-requests")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Service Requests
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Detail
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
        <>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Service Request
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                {offerLabel} {serviceRequest?.id ? `(SR ${serviceRequest.id})` : ""}
              </h1>
              <p className="text-sm text-slate-600">
                Buyer Incoterm: {(serviceRequest?.incotermBuyer || "").toString().toUpperCase()} |
                Destination: {destinationFor(serviceRequest)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Pill>{serviceRequest?.status || "REQUESTED"}</Pill>
              <span className="text-xs text-slate-500">
                Created {formatDate(serviceRequest?.createdAt)}
              </span>
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
                  <InfoRow label="Destination" value={destinationFor(serviceRequest)} />
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
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoRow label="Contact name" value={serviceRequest?.contactName} />
                  <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <FiPhone className="text-slate-500" />
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Phone
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {serviceRequest?.contactPhone || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <FiMail className="text-slate-500" />
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Email
                      </p>
                      <p className="text-sm font-semibold text-slate-900 break-all">
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
                  Create a private offer tailored to this request or return to the list to pick
                  another one.
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCreatePrivateOffer}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <FiExternalLink className="h-4 w-4" />
                    Create Private Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/provider/service-requests")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
                  >
                    Back to Service Requests
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

export default ServiceRequestDetailPage;
