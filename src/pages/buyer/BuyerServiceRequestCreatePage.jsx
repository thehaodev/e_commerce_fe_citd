import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiHome,
  FiLoader,
  FiMapPin,
  FiPhone,
  FiSend,
} from "react-icons/fi";
import { getOfferById } from "../../api/offerApi";
import { createServiceRequest } from "../../api/serviceRequestsApi";
import { checkBuyerInterest } from "../../api/buyerInterestApi";
import { BUYER_INCOTERMS } from "../../types/apiSchemas";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const OfferSummary = ({ offer }) => (
  <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Offer</p>
        <h2 className="text-xl font-bold text-gray-900">{offer?.product_name}</h2>
        <p className="text-sm text-gray-600">{offer?.description || "No description provided."}</p>
      </div>
      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
        #{offer?.id}
      </span>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <InfoChip icon={<FiClipboard />} label="Quantity" value={offer?.quantity} />
      <InfoChip icon={<FiMapPin />} label="Port of Loading" value={offer?.port_of_loading} />
      <InfoChip icon={<FiClock />} label="Cargo Ready" value={formatDate(offer?.cargo_ready_date)} />
    </div>
  </div>
);

const InfoChip = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2">
    <span className="text-amber-600">{icon}</span>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || "Not provided"}</p>
    </div>
  </div>
);

const Input = ({ label, required, ...props }) => (
  <label className="space-y-1">
    <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
      <span>{label}</span>
      {required && <span className="text-amber-600 text-xs font-semibold">Required</span>}
    </div>
    <input
      {...props}
      className={`w-full rounded-xl border border-amber-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 ${props.className || ""}`}
    />
  </label>
);

const TextArea = ({ label, required, ...props }) => (
  <label className="space-y-1">
    <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
      <span>{label}</span>
      {required && <span className="text-amber-600 text-xs font-semibold">Required</span>}
    </div>
    <textarea
      {...props}
      className={`w-full rounded-xl border border-amber-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 ${props.className || ""}`}
    />
  </label>
);

const BuyerServiceRequestCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const offerId = searchParams.get("offerId");

  const [offer, setOffer] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(true);
  const [offerError, setOfferError] = useState("");
  const [checkingInterest, setCheckingInterest] = useState(false);
  const [interestAllowed, setInterestAllowed] = useState(false);
  const [interestError, setInterestError] = useState("");

  const [form, setForm] = useState({
    incotermBuyer: "",
    portOfDischarge: "",
    countryCode: "",
    insuranceType: "",
    warehouseCode: "",
    warehouseAddress: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    note: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const requiresPort = useMemo(
    () => form.incotermBuyer === "CFR" || form.incotermBuyer === "CIF",
    [form.incotermBuyer]
  );
  const requiresWarehouse = useMemo(
    () => form.incotermBuyer === "DAP" || form.incotermBuyer === "DDP",
    [form.incotermBuyer]
  );
  const requiresInsurance = useMemo(() => form.incotermBuyer === "CIF", [form.incotermBuyer]);

  const fetchOffer = async () => {
    if (!offerId) {
      setOfferError("Offer ID is missing. Start from an offer detail to send a service request.");
      setLoadingOffer(false);
      return;
    }
    setLoadingOffer(true);
    setOfferError("");
    try {
      const res = await getOfferById(offerId);
      const payload = res?.data ?? res;
      setOffer(payload);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to load offer info for this service request.";
      setOfferError(msg);
      setOffer(null);
    } finally {
      setLoadingOffer(false);
    }
  };

  const verifyInterest = async () => {
    if (!offerId) {
      setInterestAllowed(false);
      setInterestError("Offer ID missing. Express interest before creating a service request.");
      return;
    }
    setCheckingInterest(true);
    setInterestError("");
    try {
      const res = await checkBuyerInterest(offerId);
      const interested = Boolean(res?.interested);
      setInterestAllowed(interested);
      if (!interested) {
        setInterestError("Express interest in this offer to create a service request.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not verify if you expressed interest for this offer.";
      setInterestError(msg);
      setInterestAllowed(false);
    } finally {
      setCheckingInterest(false);
    }
  };

  useEffect(() => {
    fetchOffer();
    verifyInterest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  const handleIncotermChange = (value) => {
    setFieldErrors({});
    setForm((prev) => ({
      ...prev,
      incotermBuyer: value,
      portOfDischarge: value === "CFR" || value === "CIF" ? prev.portOfDischarge : "",
      countryCode: value === "CFR" || value === "CIF" ? prev.countryCode : "",
      insuranceType: value === "CIF" ? prev.insuranceType : "",
      warehouseCode: value === "DAP" || value === "DDP" ? prev.warehouseCode : "",
      warehouseAddress: value === "DAP" || value === "DDP" ? prev.warehouseAddress : "",
      contactName: value === "DAP" || value === "DDP" ? prev.contactName : "",
      contactPhone: value === "DAP" || value === "DDP" ? prev.contactPhone : "",
      contactEmail: value === "DAP" || value === "DDP" ? prev.contactEmail : "",
    }));
  };

  const validate = () => {
    const errors = {};
    if (!form.incotermBuyer) errors.incotermBuyer = "Buyer incoterm is required.";
    if (requiresPort) {
      if (!form.portOfDischarge) errors.portOfDischarge = "Port of discharge is required.";
      if (!form.countryCode) errors.countryCode = "Country code is required.";
      if (form.countryCode && form.countryCode.length !== 2)
        errors.countryCode = "Country code must be 2 letters.";
    }
    if (requiresInsurance && !form.insuranceType) {
      errors.insuranceType = "Insurance type is required for CIF.";
    }
    if (requiresWarehouse) {
      if (!form.warehouseAddress && !form.warehouseCode) {
        errors.warehouseAddress = "Provide a warehouse address or code.";
      }
      if (!form.contactName) errors.contactName = "Contact name is required for DAP/DDP.";
      if (!form.contactPhone && !form.contactEmail) {
        errors.contactPhone = "Provide at least a phone or email for contact.";
        errors.contactEmail = "Provide at least a phone or email for contact.";
      }
    }
    if (form.contactPhone && !/^\+?[1-9]\d{7,14}$/.test(form.contactPhone)) {
      errors.contactPhone = "Phone must include country code and 8-15 digits.";
    }
    if (form.contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contactEmail)) {
      errors.contactEmail = "Please provide a valid email.";
    }
    if (form.note && form.note.length > 500) {
      errors.note = "Notes must be 500 characters or fewer.";
    }
    return errors;
  };

  const [fieldErrors, setFieldErrors] = useState({});

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!interestAllowed) {
      setSubmitError("Please express interest in this offer before sending a service request.");
      return;
    }
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        incoterm_buyer: form.incotermBuyer,
        note: form.note || null,
        port_of_discharge: requiresPort ? form.portOfDischarge : null,
        country_code: requiresPort ? (form.countryCode || "").toUpperCase() : null,
        insurance_type: requiresInsurance ? form.insuranceType || null : null,
        warehouse_code: requiresWarehouse ? form.warehouseCode || null : null,
        warehouse_address: requiresWarehouse ? form.warehouseAddress || null : null,
        contact_name: requiresWarehouse ? form.contactName || null : null,
        contact_phone: requiresWarehouse ? form.contactPhone || null : null,
        contact_email: requiresWarehouse ? form.contactEmail || null : null,
      };

      const res = await createServiceRequest(offerId, payload);
      const data = res?.data ?? res;
      const destinationId = data?.id;
      if (destinationId) {
        navigate(`/buyer/service-requests/${destinationId}`, {
          state: { success: "Service Request sent successfully." },
        });
      } else {
        navigate("/buyer/service-requests", {
          state: { success: "Service Request sent successfully." },
        });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create service request.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm hover:border-amber-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          New Service Request
        </span>
      </div>

      {loadingOffer ? (
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-32 animate-pulse rounded bg-amber-100 mb-3" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-20 rounded-xl border border-amber-50 bg-amber-50 animate-pulse" />
            ))}
          </div>
        </div>
      ) : offerError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <FiAlertCircle className="mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Offer unavailable</p>
            <p className="text-xs text-rose-600">{offerError}</p>
            <button
              type="button"
              onClick={fetchOffer}
              className="text-xs font-semibold text-rose-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        offer && <OfferSummary offer={offer} />
      )}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800">
          <FiHome className="h-5 w-5" />
          <h2 className="text-lg font-bold">Service Request details</h2>
        </div>

        {!interestAllowed && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <FiAlertCircle className="h-4 w-4 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">
                {interestError || "Express interest in this offer to enable service requests."}
              </p>
              {offerId && (
                <button
                  type="button"
                  onClick={() => navigate(`/buyer/offers/${offerId}`)}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 underline"
                >
                  Go to offer detail
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-800">Buyer Incoterm</span>
            <div className="grid grid-cols-2 gap-2">
              {BUYER_INCOTERMS.map((option) => {
                const active = form.incotermBuyer === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleIncotermChange(option)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-amber-300 bg-amber-50 text-amber-800 shadow-sm"
                        : "border-amber-100 bg-white text-gray-700 hover:border-amber-200"
                    }`}
                  >
                    {active && <FiCheckCircle className="h-4 w-4 text-amber-700" />}
                    {option}
                  </button>
                );
              })}
            </div>
            {fieldErrors.incotermBuyer && (
              <p className="text-xs text-rose-600">{fieldErrors.incotermBuyer}</p>
            )}
          </label>
          <TextArea
            label="Notes to provider"
            placeholder="Add context, timelines, or special requirements (optional)"
            rows={4}
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          />
        </div>

        {requiresPort && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Port of Discharge"
              required
              placeholder="e.g., Los Angeles"
              value={form.portOfDischarge}
              onChange={(e) => setForm((prev) => ({ ...prev, portOfDischarge: e.target.value }))}
            />
            <Input
              label="Country Code"
              required
              placeholder="US"
              value={form.countryCode}
              maxLength={2}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, countryCode: e.target.value.toUpperCase() }))
              }
            />
            {requiresInsurance && (
              <Input
                label="Insurance Type"
                required
                placeholder="Insurance details"
                value={form.insuranceType}
                onChange={(e) => setForm((prev) => ({ ...prev, insuranceType: e.target.value }))}
              />
            )}
          </div>
        )}

        {requiresWarehouse && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Warehouse Code"
                placeholder="Warehouse reference (optional)"
                value={form.warehouseCode}
                onChange={(e) => setForm((prev) => ({ ...prev, warehouseCode: e.target.value }))}
              />
              <Input
                label="Warehouse Address"
                required
                placeholder="Delivery address"
                value={form.warehouseAddress}
                onChange={(e) => setForm((prev) => ({ ...prev, warehouseAddress: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Contact Name"
                required
                placeholder="Who can coordinate delivery?"
                value={form.contactName}
                onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
              />
              <Input
                label="Contact Phone"
                placeholder="+84123456789"
                value={form.contactPhone}
                onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
              />
              <Input
                label="Contact Email"
                placeholder="logistics@example.com"
                value={form.contactEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>
          </div>
        )}

        {Object.keys(fieldErrors).length > 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            <FiAlertCircle className="mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Please fix the highlighted fields.</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {Object.values(fieldErrors).map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {submitError && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            <FiAlertCircle className="mt-0.5" />
            <div>
              <p className="font-semibold">Submission failed</p>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Required fields adjust based on the incoterm you choose (CFR/CIF vs DAP/DDP).
          </p>
          <button
            type="submit"
            disabled={
              submitting ||
              checkingInterest ||
              !form.incotermBuyer ||
              !offerId ||
              !interestAllowed
            }
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition ${
              submitting || checkingInterest
                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            {submitting || checkingInterest ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                {checkingInterest ? "Checking interest..." : "Sending..."}
              </>
            ) : (
              <>
                <FiSend className="h-4 w-4" />
                Send Service Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyerServiceRequestCreatePage;
