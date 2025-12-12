import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiGlobe,
  FiHome,
  FiLoader,
  FiMapPin,
  FiPackage,
  FiSend,
  FiX,
} from "react-icons/fi";
import { getOfferById } from "../../api/offerApi";
import { checkBuyerInterest, createBuyerInterest } from "../../api/buyerInterestApi";
import { SELLER_INCOTERMS } from "../../types/apiSchemas";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const Field = ({ label, value }) => (
  <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value || "Not provided"}</p>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
    {status || "PENDING"}
  </span>
);

const InterestBadge = ({ interested }) =>
  interested ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      <FiCheckCircle className="h-4 w-4" />
      You are interested
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      Interest pending
    </span>
  );

const ToastStack = ({ toasts, onDismiss }) => {
  if (!toasts?.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg"
        >
          <FiCheckCircle className="h-5 w-5" />
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss?.(toast.id)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const BuyerOfferDetailPage = () => {
  const navigate = useNavigate();
  const { offerId } = useParams();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [interestChecked, setInterestChecked] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [interestError, setInterestError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const fetchOffer = async () => {
    if (!offerId) {
      setError("Offer not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getOfferById(offerId);
      const payload = res?.data ?? res;
      setOffer(payload);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "This offer could not be loaded or no longer exists.";
      setError(msg);
      setOffer(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterestState = async () => {
    if (!offerId) return;
    setInterestLoading(true);
    setInterestError("");
    try {
      const res = await checkBuyerInterest(offerId);
      setIsInterested(Boolean(res?.interested));
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not verify if you already expressed interest.";
      setInterestError(msg);
      setIsInterested(false);
    } finally {
      setInterestChecked(true);
      setInterestLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
    fetchInterestState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  const handleExpressInterest = async () => {
    if (!offerId || isInterested) return;
    setInterestLoading(true);
    setInterestError("");
    setActionMessage("");
    try {
      await createBuyerInterest(offerId);
      setIsInterested(true);
      setActionMessage("You have expressed interest in this offer.");
      showToast("Interest expressed successfully.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to express interest. Please try again.";
      setInterestError(msg);
    } finally {
      setInterestChecked(true);
      setInterestLoading(false);
    }
  };

  const sellerIncoterm = useMemo(
    () => (offer?.seller_incoterm && SELLER_INCOTERMS.includes(offer.seller_incoterm)
      ? offer.seller_incoterm
      : offer?.seller_incoterm || "N/A"),
    [offer?.seller_incoterm]
  );

  const readyDate = useMemo(() => formatDate(offer?.cargo_ready_date), [offer?.cargo_ready_date]);

  const actionDisabled = interestLoading || !offer;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/buyer/home")}
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm hover:border-amber-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Offer Detail
        </span>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="h-7 w-48 animate-pulse rounded bg-amber-100 mb-4" />
          <div className="grid gap-3 md:grid-cols-2">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-24 rounded-xl border border-amber-50 bg-amber-50/60 animate-pulse" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <FiAlertCircle className="mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Could not load this offer.</p>
            <p className="text-xs text-rose-600">{error}</p>
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
        <>
          <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Product
                </p>
                <h1 className="text-3xl font-bold text-gray-900">{offer?.product_name}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                  <StatusBadge status={offer?.status} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    <FiPackage className="h-4 w-4" />
                    Qty: {offer?.quantity}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    <FiDollarSign className="h-4 w-4" />
                    Price: {offer?.price}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    <FiGlobe className="h-4 w-4" />
                    Seller Incoterm: {sellerIncoterm}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {offer?.description || "No description provided."}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                {interestChecked && <InterestBadge interested={isInterested} />}
                {actionMessage && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                    <FiCheckCircle className="h-4 w-4" />
                    {actionMessage}
                  </div>
                )}
                {interestError && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                    <FiAlertCircle className="h-4 w-4" />
                    {interestError}
                  </div>
                )}
                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={handleExpressInterest}
                    disabled={actionDisabled || isInterested}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                      isInterested
                        ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                        : "bg-amber-500 text-black hover:bg-amber-600"
                    } ${actionDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {interestLoading ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="h-4 w-4" />
                        Express Interest
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/buyer/service-requests/new?offerId=${offerId}`)}
                    disabled={!isInterested || actionDisabled}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                      !isInterested || actionDisabled
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                  >
                    <FiSend className="h-4 w-4" />
                    Send Service Request
                  </button>
                  {!isInterested && (
                    <p className="text-xs text-slate-500">
                      Express interest to unlock service requests for this offer.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Cargo Ready Date" value={<span className="flex items-center gap-2"><FiCalendar className="h-4 w-4 text-amber-600" />{readyDate}</span>} />
            <Field label="Port of Loading" value={<span className="flex items-center gap-2"><FiMapPin className="h-4 w-4 text-amber-600" />{offer?.port_of_loading || "Not provided"}</span>} />
            <Field label="Payment Terms" value={offer?.payment_terms} />
            <Field label="Seller ID" value={offer?.seller_id} />
          </div>

          <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-800">
              <FiHome className="h-5 w-5" />
              <h2 className="text-lg font-bold">Offer logistics</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Incoterm (Seller)" value={sellerIncoterm} />
              <Field label="Status" value={offer?.status} />
              <Field label="Created At" value={formatDate(offer?.created_at)} />
              <Field label="Updated At" value={formatDate(offer?.updated_at)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerOfferDetailPage;
