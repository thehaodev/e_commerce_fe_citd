import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiLayers,
  FiRefreshCw,
  FiX,
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
  sellerConfirmationStatus:
    item?.seller_confirmation_status || item?.sellerConfirmationStatus || "PENDING",
  sellerConfirmedAt: item?.seller_confirmed_at || item?.sellerConfirmedAt || null,
  sellerConfirmedBy: item?.seller_confirmed_by || item?.sellerConfirmedBy || null,
  sellerConfirmationChannel:
    item?.seller_confirmation_channel || item?.sellerConfirmationChannel || null,
  sellerConfirmationNote: item?.seller_confirmation_note || item?.sellerConfirmationNote || null,
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

const SellerConfirmationBadge = ({ status }) => {
  const tone =
    status === "CONFIRMED"
      ? "emerald"
      : status === "REJECTED"
        ? "rose"
        : "amber";
  const label =
    status === "CONFIRMED"
      ? "Seller confirmed (offline)"
      : status === "REJECTED"
        ? "Seller rejected (offline)"
        : "Seller confirmation: Pending";
  const bgClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "rose"
        ? "bg-rose-50 text-rose-700 border-rose-100"
        : "bg-amber-50 text-amber-800 border-amber-100";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${bgClass}`}
    >
      {label}
    </span>
  );
};

const formatDateTime = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const ProviderPrivateOfferDetailPage = () => {
  const { privateOfferId } = useParams();
  const navigate = useNavigate();

  const [privateOffer, setPrivateOffer] = useState(null);
  const [offer, setOffer] = useState(null);
  const [serviceRequest, setServiceRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [confirmForm, setConfirmForm] = useState({
    confirmed_by: "",
    channel: "EMAIL",
    note: "",
  });
  const [confirmFormErrors, setConfirmFormErrors] = useState({});

  const showToast = useCallback((message, tone = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

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

  const validateConfirmForm = useCallback(() => {
    const errors = {};
    if (!confirmForm.confirmed_by.trim()) {
      errors.confirmed_by = "Confirmed by is required.";
    }
    if (!confirmForm.channel) {
      errors.channel = "Channel is required.";
    }
    const note = confirmForm.note.trim();
    if (!note) {
      errors.note = "Note is required.";
    } else if (note.length < 10) {
      errors.note = "Note must be at least 10 characters.";
    } else if (note.length > 1000) {
      errors.note = "Note must be 1000 characters or less.";
    }
    setConfirmFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [confirmForm]);

  const handleConfirmFieldChange = (field) => (e) => {
    const value = e.target.value;
    setConfirmForm((prev) => ({ ...prev, [field]: value }));
    setConfirmFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmitSellerConfirm = async (e) => {
    e.preventDefault();
    setConfirmError("");
    const isValid = validateConfirmForm();
    if (!isValid || !privateOfferId) return;

    setConfirmSubmitting(true);
    try {
      await privateOfferApi.confirmSeller(privateOfferId, {
        confirmed_by: confirmForm.confirmed_by.trim(),
        channel: confirmForm.channel,
        note: confirmForm.note.trim(),
      });
      showToast("Seller marked as confirmed.");
      setShowConfirmModal(false);
      setConfirmForm({ confirmed_by: "", channel: "EMAIL", note: "" });
      await fetchDetail();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not mark seller as confirmed right now.";
      setConfirmError(msg);
    } finally {
      setConfirmSubmitting(false);
    }
  };

  const closeConfirmModal = () => {
    if (confirmSubmitting) return;
    setShowConfirmModal(false);
    setConfirmError("");
    setConfirmFormErrors({});
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateOfferId]);

  const offerLabel = useMemo(() => {
    if (!offer) return "Offer";
    return offer.product_name || `Offer ${offer.id || ""}` || "Offer";
  }, [offer]);

  const sellerConfirmationStatus = privateOffer?.sellerConfirmationStatus || "PENDING";
  const isSellerConfirmed = sellerConfirmationStatus === "CONFIRMED";
  const isSellerRejected = sellerConfirmationStatus === "REJECTED";
  const sendProposalDisabled = !privateOffer?.id || !isSellerConfirmed;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

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
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FiCheckCircle className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-lg font-bold">Seller confirmation (offline)</h3>
                  </div>
                  <SellerConfirmationBadge status={sellerConfirmationStatus} />
                </div>

                {isSellerConfirmed || isSellerRejected ? (
                  <div className="space-y-2">
                    <InfoRow
                      label={isSellerRejected ? "Updated by" : "Confirmed by"}
                      value={privateOffer?.sellerConfirmedBy}
                    />
                    <InfoRow
                      label="Channel"
                      value={privateOffer?.sellerConfirmationChannel}
                    />
                    <InfoRow
                      label={isSellerRejected ? "Updated at" : "Confirmed at"}
                      value={formatDateTime(privateOffer?.sellerConfirmedAt)}
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                        Note
                      </p>
                      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                        {privateOffer?.sellerConfirmationNote || "No note provided."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Seller confirmation is required before sending a proposal.
                  </div>
                )}

                {sellerConfirmationStatus === "PENDING" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmError("");
                      setConfirmFormErrors({});
                      setShowConfirmModal(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Mark Seller Confirmed (offline)
                  </button>
                ) : null}
              </div>

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
                  disabled={sendProposalDisabled}
                  onClick={() =>
                    !sendProposalDisabled &&
                    navigate(`/provider/proposals/new?privateOfferId=${privateOffer.id}`, {
                      state: { privateOffer, serviceRequest, offer },
                    })
                  }
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    !sendProposalDisabled
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Send Proposal
                </button>
                {sendProposalDisabled ? (
                  <p className="text-xs text-amber-700">
                    Seller confirmation (offline) is required before sending a proposal.
                  </p>
                ) : null}
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

      {showConfirmModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Mark Seller Confirmed (offline)</h3>
                <p className="text-sm text-slate-600">
                  Record the offline confirmation details for this seller.
                </p>
              </div>
              <button
                type="button"
                onClick={closeConfirmModal}
                className="text-slate-500 hover:text-slate-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {confirmError ? (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <FiAlertCircle className="h-4 w-4 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Could not save confirmation.</p>
                  <p className="text-xs text-rose-600">{confirmError}</p>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmitSellerConfirm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">
                  Confirmed by <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={confirmForm.confirmed_by}
                  onChange={handleConfirmFieldChange("confirmed_by")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Person who confirmed"
                />
                {confirmFormErrors.confirmed_by ? (
                  <p className="text-xs text-rose-600">{confirmFormErrors.confirmed_by}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">
                  Channel <span className="text-rose-600">*</span>
                </label>
                <select
                  value={confirmForm.channel}
                  onChange={handleConfirmFieldChange("channel")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
                >
                  {["EMAIL", "PHONE", "ZALO", "MEETING", "OTHER"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {confirmFormErrors.channel ? (
                  <p className="text-xs text-rose-600">{confirmFormErrors.channel}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">
                  Note <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={confirmForm.note}
                  onChange={handleConfirmFieldChange("note")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
                  rows={4}
                  minLength={10}
                  maxLength={1000}
                  placeholder="Details of the offline confirmation (min 10 characters)"
                />
                {confirmFormErrors.note ? (
                  <p className="text-xs text-rose-600">{confirmFormErrors.note}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={closeConfirmModal}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                  disabled={confirmSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmSubmitting}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    confirmSubmitting
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {confirmSubmitting ? "Saving..." : "Confirm seller"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ToastStack = ({ toasts, onDismiss }) => {
  if (!toasts?.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const tone = toast.tone === "error" ? "rose" : "emerald";
        const border = tone === "rose" ? "border-rose-200" : "border-emerald-200";
        const bg = tone === "rose" ? "bg-rose-50" : "bg-emerald-50";
        const text = tone === "rose" ? "text-rose-800" : "text-emerald-800";

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3 text-sm font-semibold ${text} shadow-lg`}
          >
            <FiCheckCircle className="h-4 w-4" />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss?.(toast.id)}
              className={`${text} hover:opacity-80`}
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        );
      })}
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
