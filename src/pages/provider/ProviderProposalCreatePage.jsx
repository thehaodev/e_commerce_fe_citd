import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiLoader,
  FiTag,
  FiX,
} from "react-icons/fi";
import { getOfferById } from "../../api/offerApi";
import { privateOfferApi } from "../../api/privateOffersApi";
import proposalApi from "../../api/proposalsApi";
import {
  destinationForServiceRequest,
  fetchProviderServiceRequestById,
  getCachedProviderServiceRequest,
  normalizeProviderServiceRequest,
} from "../../utils/providerServiceRequestUtils";

const normalizePrivateOffer = (item = {}) => ({
  id: item?.id || "",
  offerId: item?.offer_id || item?.offerId || "",
  serviceRequestId: item?.service_request_id || item?.serviceRequestId || "",
  providerId: item?.provider_id || item?.providerId || "",
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
  createdAt: item?.created_at || item?.createdAt || "",
  updatedAt: item?.updated_at || item?.updatedAt || "",
});

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const ProposalField = ({
  label,
  required,
  children,
  error,
}) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-slate-800">
      {label} {required ? <span className="text-rose-600">*</span> : null}
    </label>
    {children}
    {error ? <p className="text-xs text-rose-600">{error}</p> : null}
  </div>
);

const ProviderProposalCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const privateOfferId = searchParams.get("privateOfferId");

  const routeState = location.state || {};
  const routePrivateOffer = routeState.privateOffer
    ? normalizePrivateOffer(routeState.privateOffer)
    : null;
  const routeServiceRequest =
    routeState.serviceRequest &&
    routeState.serviceRequest.id &&
    routeState.serviceRequest.id === routeState.privateOffer?.serviceRequestId
      ? normalizeProviderServiceRequest(routeState.serviceRequest)
      : null;
  const cachedServiceRequest =
    !routeServiceRequest && routeState.privateOffer?.serviceRequestId
      ? getCachedProviderServiceRequest(routeState.privateOffer.serviceRequestId)
      : null;

  const [privateOffer, setPrivateOffer] = useState(routePrivateOffer);
  const [offer, setOffer] = useState(routeState.offer || null);
  const [serviceRequest, setServiceRequest] = useState(routeServiceRequest || cachedServiceRequest);
  const [loadingContext, setLoadingContext] = useState(Boolean(!routePrivateOffer));
  const [contextError, setContextError] = useState("");

  const [form, setForm] = useState({
    serviceFee: "",
    totalCost: "",
    leadTime: "",
    eta: "",
    serviceConditions: "",
    extraCharges: "0",
    providerNotes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toasts, setToasts] = useState([]);

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

  const offerLabel = useMemo(() => {
    if (!offer) return "Offer";
    return offer.product_name || `Offer ${offer.id || ""}` || "Offer";
  }, [offer]);

  const isSellerConfirmed = privateOffer?.sellerConfirmationStatus === "CONFIRMED";

  const onBlurMoney = (field) => () => {
    const value = form[field];
    if (value === "") return;
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      setForm((prev) => ({ ...prev, [field]: parsed.toFixed(2) }));
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = useCallback(() => {
    const errors = {};
    const fee = Number(form.serviceFee);
    const total = Number(form.totalCost);
    const lead = Number(form.leadTime);
    const extra = Number(form.extraCharges || 0);
    const etaDate = new Date(form.eta);
    if (!form.serviceFee || Number.isNaN(fee) || fee <= 0) {
      errors.serviceFee = "Service fee must be greater than 0.";
    }
    if (!form.totalCost || Number.isNaN(total)) {
      errors.totalCost = "Total cost is required.";
    } else if (!Number.isNaN(fee) && total < fee) {
      errors.totalCost = "Total cost must be at least the service fee.";
    }
    if (!form.leadTime || Number.isNaN(lead) || !Number.isInteger(lead) || lead <= 0) {
      errors.leadTime = "Lead time must be a whole number greater than 0.";
    }
    if (!form.eta || Number.isNaN(etaDate.getTime())) {
      errors.eta = "ETA is required and must be a valid date.";
    }
    if (!form.serviceConditions.trim()) {
      errors.serviceConditions = "Service conditions are required.";
    }
    if (form.extraCharges !== "" && (Number.isNaN(extra) || extra < 0)) {
      errors.extraCharges = "Extra charges must be zero or a positive number.";
    }
    if (form.providerNotes && form.providerNotes.length > 500) {
      errors.providerNotes = "Provider notes must be 500 characters or less.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const isFormValuesValid = useMemo(() => {
    const fee = Number(form.serviceFee);
    const total = Number(form.totalCost);
    const lead = Number(form.leadTime);
    const extra = Number(form.extraCharges || 0);
    const etaDate = new Date(form.eta);
    if (!form.serviceFee || Number.isNaN(fee) || fee <= 0) return false;
    if (!form.totalCost || Number.isNaN(total) || total < fee) return false;
    if (!form.leadTime || Number.isNaN(lead) || !Number.isInteger(lead) || lead <= 0)
      return false;
    if (!form.eta || Number.isNaN(etaDate.getTime())) return false;
    if (!form.serviceConditions.trim()) return false;
    if (form.extraCharges !== "" && (Number.isNaN(extra) || extra < 0)) return false;
    if (form.providerNotes && form.providerNotes.length > 500) return false;
    return true;
  }, [form]);

  const isSubmitDisabled = submitting || loadingContext || !isFormValuesValid || !isSellerConfirmed;

  const fetchContext = useCallback(async () => {
    if (!privateOfferId) {
      setContextError("Missing private offer reference.");
      setLoadingContext(false);
      return;
    }
    setLoadingContext(true);
    setContextError("");
    try {
      let po = routePrivateOffer || privateOffer;
      if (!po) {
        const res = await privateOfferApi.getPrivateOfferById(privateOfferId);
        po = normalizePrivateOffer(res?.data ?? res);
        setPrivateOffer(po);
      }

      let offerData = routeState.offer || offer;
      if (!offerData && po?.offerId) {
        const offerRes = await getOfferById(po.offerId);
        offerData = offerRes?.data ?? offerRes;
        setOffer(offerData);
      }

      let sr = routeServiceRequest || serviceRequest || cachedServiceRequest;
      if (!sr && po?.serviceRequestId) {
        sr = await fetchProviderServiceRequestById({
          serviceRequestId: po.serviceRequestId,
          offerId: po.offerId,
          limit: 200,
          offset: 0,
        });
        setServiceRequest(sr ? normalizeProviderServiceRequest(sr) : null);
      }

      if (!po) {
        setContextError("Could not find this private offer.");
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 401 || status === 403
          ? "You are not allowed"
          : err?.response?.data?.detail ||
            err?.message ||
            "Could not load the related private offer.";
      setContextError(msg);
      setPrivateOffer(null);
      setOffer(null);
      setServiceRequest(null);
    } finally {
      setLoadingContext(false);
    }
  }, [
    cachedServiceRequest,
    offer,
    privateOffer,
    privateOfferId,
    routePrivateOffer,
    routeServiceRequest,
    routeState.offer,
    serviceRequest,
  ]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccessMessage("");
    const isValid = validate();
    if (!isValid || !privateOfferId) return;

    setSubmitting(true);
    try {
      const payload = {
        service_fee: Number(form.serviceFee),
        total_cost: Number(form.totalCost),
        lead_time: Number(form.leadTime),
        eta: form.eta,
        service_conditions: form.serviceConditions.trim(),
        extra_charges: form.extraCharges === "" ? 0 : Number(form.extraCharges),
        provider_notes: form.providerNotes ? form.providerNotes.trim() : null,
      };
      const res = await proposalApi.createProposal(privateOfferId, payload);
      const data = res?.data ?? res;
      const proposalId = data?.id || data?.proposal_id;
      const successText = proposalId
        ? `Proposal #${proposalId} sent successfully.`
        : "Proposal sent successfully.";
      setSuccessMessage(successText);
      if (proposalId) {
        navigate(`/provider/proposals/${proposalId}`, {
          replace: true,
        });
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 401 || status === 403
          ? "You are not allowed"
          : err?.response?.data?.detail || err?.message || "Failed to create proposal.";
      setSubmitError(msg);
      if (status === 400 || status === 409) {
        showToast(msg, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!privateOfferId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate("/provider/private-offers")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Private Offers
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Send Proposal
          </span>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          Missing privateOfferId. Please start from a private offer detail.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/provider/private-offers/${privateOfferId}`)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Private Offer
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Send Proposal
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">Send Proposal</h1>
          <p className="text-sm text-slate-600">
            Respond to the buyer with your proposal terms for this private offer.
          </p>
        </div>

        {loadingContext ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="h-24 rounded-xl border border-slate-100 bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : contextError ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            <FiAlertCircle className="mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Could not load context.</p>
              <p className="text-xs text-rose-600">{contextError}</p>
              <button
                type="button"
                onClick={fetchContext}
                className="text-xs font-semibold text-rose-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-900">
                <FiTag className="text-emerald-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Private Offer</h3>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {privateOffer?.id ? `#PO-${privateOffer.id}` : "Private Offer"}
              </p>
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <span>Offer ID: {privateOffer?.offerId || "N/A"}</span>
                <span>Service Request: {privateOffer?.serviceRequestId || "N/A"}</span>
                <span>Negotiated price: {privateOffer?.negotiatedPrice || "N/A"}</span>
                <span>Updated CRD: {formatDate(privateOffer?.updatedCrd)}</span>
                <span>Updated ETD: {formatDate(privateOffer?.updatedEtd)}</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-900">
                <FiLayers className="text-emerald-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Offer</h3>
              </div>
              <p className="text-lg font-bold text-slate-900">{offerLabel}</p>
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <span>ID: {offer?.id ? `#${offer.id}` : "N/A"}</span>
                <span>Seller incoterm: {offer?.seller_incoterm || "N/A"}</span>
                <span>Quantity: {offer?.quantity || "N/A"}</span>
                <span>CRD: {formatDate(offer?.cargo_ready_date)}</span>
                <span>Port of Loading: {offer?.port_of_loading || "N/A"}</span>
                <span>Price: {offer?.price || "N/A"}</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-slate-900">
                <FiClock className="text-emerald-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Service Request</h3>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {serviceRequest?.id ? `SR #${serviceRequest.id}` : "Service Request"}
              </p>
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                <span>Buyer incoterm: {(serviceRequest?.incotermBuyer || "").toUpperCase()}</span>
                <span>Destination: {destinationForServiceRequest(serviceRequest)}</span>
                <span>
                  Buyer: {serviceRequest?.contactName || serviceRequest?.contactEmail || "N/A"}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Buyer notes
                </p>
                <p className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm text-slate-800">
                  {serviceRequest?.note || "No additional notes provided."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {!loadingContext && !contextError && privateOffer && !isSellerConfirmed ? (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <FiAlertCircle className="h-4 w-4 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Seller confirmation required.</p>
            <p className="text-xs text-amber-700">
              Seller confirmation (offline) is required before sending a proposal for this private
              offer.
            </p>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-2">
          <FiFileText className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900">Proposal terms</h2>
        </div>

        {submitError ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <FiAlertCircle className="mt-0.5" />
            <div>
              <p className="font-semibold">Failed to send proposal.</p>
              <p className="text-xs text-rose-600">{submitError}</p>
            </div>
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <FiCheckCircle className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <ProposalField label="Service fee" required error={formErrors.serviceFee}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.serviceFee}
                onChange={handleChange("serviceFee")}
                onBlur={onBlurMoney("serviceFee")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-9 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter service fee"
              />
            </div>
          </ProposalField>
          <ProposalField label="Total cost" required error={formErrors.totalCost}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.totalCost}
                onChange={handleChange("totalCost")}
                onBlur={onBlurMoney("totalCost")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-9 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter total cost"
              />
            </div>
          </ProposalField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProposalField label="Lead time (days)" required error={formErrors.leadTime}>
            <input
              type="number"
              min="1"
              step="1"
              value={form.leadTime}
              onChange={handleChange("leadTime")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter lead time in days"
            />
          </ProposalField>
          <ProposalField label="ETA" required error={formErrors.eta}>
            <input
              type="date"
              value={form.eta}
              onChange={handleChange("eta")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
            />
          </ProposalField>
        </div>

        <ProposalField label="Service conditions" required error={formErrors.serviceConditions}>
          <textarea
            value={form.serviceConditions}
            onChange={handleChange("serviceConditions")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
            rows={4}
            placeholder="Terms, inclusions, exclusions, and assumptions"
          />
        </ProposalField>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProposalField label="Extra charges" error={formErrors.extraCharges}>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.extraCharges}
                onChange={handleChange("extraCharges")}
                onBlur={onBlurMoney("extraCharges")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-9 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
                placeholder="0.00"
              />
            </div>
          </ProposalField>
          <ProposalField label="Provider notes" error={formErrors.providerNotes}>
            <textarea
              value={form.providerNotes}
              onChange={handleChange("providerNotes")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
              rows={3}
              maxLength={500}
              placeholder="Optional notes for the buyer (500 chars max)"
            />
          </ProposalField>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Required fields are marked with <span className="text-rose-600">*</span>
          </p>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition ${
              isSubmitDisabled
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {submitting ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Sending proposal...
              </>
            ) : (
              "Send Proposal"
            )}
          </button>
        </div>
      </form>
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

export default ProviderProposalCreatePage;
