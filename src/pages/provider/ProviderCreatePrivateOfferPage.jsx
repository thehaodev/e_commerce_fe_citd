import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiLoader,
  FiTag,
} from "react-icons/fi";
import { getOfferById } from "../../api/offerApi";
import { privateOfferApi } from "../../api/privateOffersApi";
import {
  destinationForServiceRequest,
  fetchProviderServiceRequestById,
  getCachedProviderServiceRequest,
  normalizeProviderServiceRequest,
} from "../../utils/providerServiceRequestUtils";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const ProviderCreatePrivateOfferPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const serviceRequestId = searchParams.get("serviceRequestId");
  const offerId = searchParams.get("offerId");

  const routeState = location.state || {};
  const routeServiceRequest =
    routeState.serviceRequest && `${routeState.serviceRequest.id}` === `${serviceRequestId}`
      ? normalizeProviderServiceRequest(routeState.serviceRequest)
      : null;
  const routeOffer = routeServiceRequest ? routeState.offer : null;
  const cachedServiceRequest =
    !routeServiceRequest && serviceRequestId
      ? getCachedProviderServiceRequest(serviceRequestId)
      : null;

  const initialServiceRequest = routeServiceRequest || cachedServiceRequest || null;

  const [serviceRequest, setServiceRequest] = useState(initialServiceRequest);
  const [offer, setOffer] = useState(routeOffer || null);
  const [loadingContext, setLoadingContext] = useState(!(initialServiceRequest && routeOffer));
  const [contextError, setContextError] = useState("");
  const [form, setForm] = useState({
    negotiatedPrice: "",
    updatedCrd: "",
    updatedEtd: "",
    sellerDocumentation: "",
    internalNotes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const errors = {};
    const price = Number(form.negotiatedPrice);
    if (!form.negotiatedPrice || Number.isNaN(price) || price <= 0) {
      errors.negotiatedPrice = "Negotiated price must be a positive number.";
    }
    if (!form.sellerDocumentation.trim()) {
      errors.sellerDocumentation = "Seller documentation is required.";
    }
    const now = new Date();
    if (form.updatedCrd) {
      const d = new Date(form.updatedCrd);
      if (!Number.isNaN(d.getTime()) && d < now) {
        errors.updatedCrd = "CRD should be in the future.";
      }
    }
    if (form.updatedEtd) {
      const d = new Date(form.updatedEtd);
      if (!Number.isNaN(d.getTime()) && d < now) {
        errors.updatedEtd = "ETD should be in the future.";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchContext = useCallback(async () => {
    if (!serviceRequestId || !offerId) {
      setContextError("Missing service request or offer information.");
      setLoadingContext(false);
      return;
    }

    setLoadingContext(true);
    setContextError("");
    try {
      let sr = routeServiceRequest || serviceRequest;
      if (!sr) {
        sr = await fetchProviderServiceRequestById({
          serviceRequestId,
          offerId,
          limit: 200,
          offset: 0,
        });
        setServiceRequest(sr || null);
      }

      let offerData = routeOffer || offer;
      if (!offerData) {
        const offerRes = await getOfferById(offerId);
        offerData = offerRes?.data ?? offerRes;
        setOffer(offerData);
      }

      if (!sr) {
        setContextError("Request not found or no longer available.");
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 401 || status === 403
          ? "You are not allowed"
          : err?.response?.data?.detail ||
            err?.message ||
            "Could not load the related service request or offer.";
      setContextError(msg);
      setServiceRequest(null);
      setOffer(null);
    } finally {
      setLoadingContext(false);
    }
  }, [offer, offerId, routeOffer, routeServiceRequest, serviceRequest, serviceRequestId]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccessMessage("");
    const isValid = validate();
    if (!isValid || !offerId || !serviceRequestId) return;

    setSubmitting(true);
    try {
      const payload = {
        negotiated_price: Number(form.negotiatedPrice),
        updated_crd: form.updatedCrd || null,
        updated_etd: form.updatedEtd || null,
        seller_documentation: form.sellerDocumentation,
        internal_notes: form.internalNotes || null,
      };
      const res = await privateOfferApi.createPrivateOffer(offerId, serviceRequestId, payload);
      const data = res?.data ?? res;
      const newId = data?.id || data?.private_offer_id || null;
      const message = newId
        ? `Private offer #${newId} created successfully.`
        : "Private offer created successfully.";
      setSuccessMessage(message);
      navigate("/provider/private-offers", {
        state: { successMessage: message },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to create private offer.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const offerLabel = useMemo(() => {
    if (!offer) return "Offer";
    return offer.product_name || `Offer ${offer.id || ""}` || "Offer";
  }, [offer]);

  if (!serviceRequestId || !offerId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate("/provider/service-requests")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Service Requests
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Create Private Offer
          </span>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          Missing query parameters. Please start from a service request detail page.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate("/provider/service-requests", { state: { serviceRequest, offer } })
          }
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Service Requests
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Create Private Offer
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">New Private Offer</h1>
          <p className="text-sm text-slate-600">
            Craft a proposal tailored to the buyer&apos;s service request.
          </p>
        </div>

        {loadingContext ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="h-28 rounded-xl border border-slate-100 bg-slate-100 animate-pulse"
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
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-900">
                <FiClock className="text-emerald-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  Service Request
                </h3>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {serviceRequest?.id ? `SR #${serviceRequest.id}` : "Service Request"}
              </p>
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <span>Buyer incoterm: {(serviceRequest?.incotermBuyer || "").toUpperCase()}</span>
                <span>Destination: {destinationForServiceRequest(serviceRequest)}</span>
                <span>
                  Buyer: {serviceRequest?.contactName || serviceRequest?.contactEmail || "N/A"}
                </span>
                <span>Status: {serviceRequest?.status || "REQUESTED"}</span>
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

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-2">
          <FiFileText className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900">Private Offer terms</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800">
              Negotiated price <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.negotiatedPrice}
              onChange={handleInputChange("negotiatedPrice")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter proposed price"
              required
            />
            {formErrors.negotiatedPrice && (
              <p className="text-xs text-rose-600">{formErrors.negotiatedPrice}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800">Internal notes</label>
            <textarea
              value={form.internalNotes}
              onChange={handleInputChange("internalNotes")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
              rows={3}
              placeholder="Optional notes kept internal to your team"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800">Updated CRD</label>
            <input
              type="date"
              value={form.updatedCrd}
              onChange={handleInputChange("updatedCrd")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
            />
            {formErrors.updatedCrd && (
              <p className="text-xs text-rose-600">{formErrors.updatedCrd}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800">Updated ETD</label>
            <input
              type="date"
              value={form.updatedEtd}
              onChange={handleInputChange("updatedEtd")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
            />
            {formErrors.updatedEtd && (
              <p className="text-xs text-rose-600">{formErrors.updatedEtd}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800">
            Seller documentation <span className="text-rose-600">*</span>
          </label>
          <textarea
            value={form.sellerDocumentation}
            onChange={handleInputChange("sellerDocumentation")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
            rows={4}
            maxLength={2000}
            placeholder="Summarize key terms, documents, and justifications for this offer"
            required
          />
          {formErrors.sellerDocumentation && (
            <p className="text-xs text-rose-600">{formErrors.sellerDocumentation}</p>
          )}
        </div>

        {submitError && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <FiAlertCircle className="mt-0.5" />
            <div>
              <p className="font-semibold">Failed to create private offer.</p>
              <p className="text-xs text-rose-600">{submitError}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <FiCheckCircle className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Required fields are marked with <span className="text-rose-600">*</span>
          </p>
          <button
            type="submit"
            disabled={submitting || loadingContext}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition ${
              submitting || loadingContext
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {submitting ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Creating private offer...
              </>
            ) : (
              "Create Private Offer"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProviderCreatePrivateOfferPage;
