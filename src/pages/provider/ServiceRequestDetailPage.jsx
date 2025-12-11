import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiLayers,
} from "react-icons/fi";
import { getServiceRequestDetail } from "../../api/providerApi";

const normalizeServiceRequestDetail = (payload) => {
  const data = payload?.data ?? payload ?? {};
  const offer = data.offer || data.offer_detail || data.offerDetail || {};
  const buyer = data.buyer || {};
  const seller = offer.seller || data.seller || {};

  const id =
    data.id || data.service_request_id || data.serviceRequestId || data.service_request_uuid;

  return {
    id,
    status:
      (data.status || "")
        .toString()
        .replace(/_/g, " ")
        .trim() || "REQUESTED",
    createdAt: data.created_at || data.createdAt || data.created_date,
    incotermBuyer:
      (data.incoterm_buyer || data.incotermBuyer || data.incoterm || "")?.toString()?.toUpperCase() ||
      "—",
    destination:
      data.port_of_discharge ||
      data.destination ||
      data.delivery_location ||
      data.buyer_destination ||
      "—",
    buyerNotes: data.note || data.notes || data.buyer_note || data.buyerNotes || "",
    buyerName:
      data.buyer_name ||
      data.buyerName ||
      buyer.company_name ||
      buyer.full_name ||
      buyer.name ||
      "Buyer",
    offer: {
      id: data.offer_id || data.offerId || offer.id,
      code: data.offer_code || data.offerCode || offer.offer_code || offer.code,
      title: offer.title || offer.offer_title || offer.product_name || "Offer",
      product: offer.product_name || offer.product,
      commodity: offer.commodity || offer.product_name,
      quantity: offer.quantity,
      unit: offer.unit || offer.unit_measure,
      incotermSeller: offer.seller_incoterm || offer.incoterm,
      portOfLoading: offer.port_of_loading || offer.port,
      cargoReadyDate: offer.cargo_ready_date,
      etd: offer.etd || offer.estimated_time_departure,
      seller:
        seller.company_name ||
        seller.full_name ||
        seller.name ||
        offer.seller_name ||
        data.seller_name ||
        "Seller",
    },
  };
};

const formatDate = (value) => {
  if (!value) return "—";
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
    <p className="text-sm font-semibold text-slate-900 text-right">{value || "—"}</p>
  </div>
);

const ServiceRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceRequest, setServiceRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    if (!id) {
      setError("Service request not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getServiceRequestDetail(id);
      const data = res?.data ?? res;
      setServiceRequest(normalizeServiceRequestDetail(data));
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to load this service request right now.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const offerLabel = useMemo(() => {
    if (!serviceRequest?.offer) return "Service Request";
    return serviceRequest.offer.code || serviceRequest.offer.title || "Service Request";
  }, [serviceRequest]);

  const handleComingSoon = (action) => {
    const ref = serviceRequest?.id ? ` (SR: ${serviceRequest.id})` : "";
    window.alert(`${action} flow coming soon${ref}.`);
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
              <div key={idx} className="h-28 rounded-xl border border-slate-100 bg-slate-100 animate-pulse" />
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
              <h1 className="text-2xl font-bold text-slate-900">{offerLabel}</h1>
              <p className="text-sm text-slate-600">
                Buyer: {serviceRequest?.buyerName || "Buyer"} • Incoterm:{" "}
                {serviceRequest?.incotermBuyer}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Pill>{serviceRequest?.status}</Pill>
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
                  <InfoRow label="Offer code" value={serviceRequest?.offer?.code || "—"} />
                  <InfoRow label="Title" value={serviceRequest?.offer?.title} />
                  <InfoRow label="Commodity" value={serviceRequest?.offer?.commodity} />
                  <InfoRow
                    label="Quantity"
                    value={
                      serviceRequest?.offer?.quantity
                        ? `${serviceRequest.offer.quantity} ${serviceRequest.offer.unit || ""}`
                        : "—"
                    }
                  />
                  <InfoRow label="Seller" value={serviceRequest?.offer?.seller} />
                  <InfoRow label="Seller Incoterm" value={serviceRequest?.offer?.incotermSeller} />
                  <InfoRow
                    label="Cargo Ready Date"
                    value={formatDate(serviceRequest?.offer?.cargoReadyDate)}
                  />
                  <InfoRow label="ETD" value={formatDate(serviceRequest?.offer?.etd)} />
                  <InfoRow label="Port of Loading" value={serviceRequest?.offer?.portOfLoading} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <FiClock className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg font-bold">Service Request details</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Buyer Incoterm" value={serviceRequest?.incotermBuyer} />
                  <InfoRow label="Destination" value={serviceRequest?.destination} />
                  <InfoRow label="Created" value={formatDate(serviceRequest?.createdAt)} />
                  <InfoRow label="Status" value={serviceRequest?.status} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Buyer notes
                  </p>
                  <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                    {serviceRequest?.buyerNotes || "No additional notes provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <h3 className="text-lg font-bold text-emerald-900 mb-2">Next steps</h3>
                <p className="text-sm text-emerald-800 mb-4">
                  Create a private offer or send a proposal based on this request.
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleComingSoon("Create Private Offer")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <FiExternalLink className="h-4 w-4" />
                    Create Private Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleComingSoon("Send Proposal")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
                  >
                    <FiCheckCircle className="h-4 w-4" />
                    Send Proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/provider/service-requests")}
                    className="w-full text-sm font-semibold text-slate-700 underline"
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
