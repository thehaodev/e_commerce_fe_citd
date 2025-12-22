import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiDollarSign,
  FiGlobe,
  FiLoader,
  FiMapPin,
  FiSend,
  FiX,
} from "react-icons/fi";
import { getOfferById } from "../../api/offerApi";
import { checkBuyerInterest, createBuyerInterest } from "../../api/buyerInterestApi";
import { SELLER_INCOTERMS } from "../../types/apiSchemas";

const EMPTY_PLACEHOLDER = "\u2014";

const formatDate = (value) => {
  if (!value) return EMPTY_PLACEHOLDER;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
};

const normalizeImageSrc = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.url || value.image_url || value.imageUrl || null;
  }
  return null;
};

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

  const variants = {
    success: {
      container: "border-emerald-200 bg-emerald-50 text-emerald-800",
      iconColor: "text-emerald-600",
      Icon: FiCheckCircle,
    },
    error: {
      container: "border-rose-200 bg-rose-50 text-rose-800",
      iconColor: "text-rose-600",
      Icon: FiAlertCircle,
    },
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const variant = variants[toast.variant] || variants.success;
        const Icon = variant.Icon;
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${variant.container}`}
          >
            <Icon className={`h-5 w-5 ${variant.iconColor}`} />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss?.(toast.id)}
              className="text-sm font-bold"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        );
      })}
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
  const [expressInterestLoading, setExpressInterestLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [interestError, setInterestError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [toasts, setToasts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);

  const showToast = useCallback((message, variant = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
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
    setExpressInterestLoading(true);
    setInterestError("");
    setActionMessage("");
    try {
      await createBuyerInterest(offerId);
      setIsInterested(true);
      setActionMessage("You have expressed interest in this offer.");
      showToast("Interest sent successfully. You can now create a Service Request.");
      setInterestChecked(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to express interest. Please try again.";
      setInterestError(msg);
      showToast(msg, "error");
    } finally {
      setExpressInterestLoading(false);
    }
  };

  const sellerIncoterm = useMemo(
    () => (offer?.seller_incoterm && SELLER_INCOTERMS.includes(offer.seller_incoterm)
      ? offer.seller_incoterm
      : offer?.seller_incoterm || "N/A"),
    [offer?.seller_incoterm]
  );

  const readyDate = useMemo(() => formatDate(offer?.cargo_ready_date), [offer?.cargo_ready_date]);

  const actionDisabled = interestLoading || expressInterestLoading || !offer;

  const title =
    offer?.product_name ||
    offer?.title ||
    offer?.name ||
    offer?.product ||
    "Offer detail";
  const description = offer?.description || EMPTY_PLACEHOLDER;
  const priceValue = useMemo(() => {
    if (offer?.price === null || offer?.price === undefined) return EMPTY_PLACEHOLDER;
    const numericPrice = Number(offer.price);
    if (Number.isNaN(numericPrice)) return offer.price;
    return `$${numericPrice} / KG`;
  }, [offer?.price]);
  const quantityValue = offer?.quantity ? `${offer.quantity} KG` : offer?.quantity || EMPTY_PLACEHOLDER;
  const crdValue = readyDate || EMPTY_PLACEHOLDER;

  const sellerName =
    offer?.seller_name ||
    offer?.seller_company ||
    offer?.seller?.name ||
    offer?.seller?.company_name ||
    "Unknown seller";
  const sellerAvatar =
    offer?.seller_avatar ||
    offer?.seller_avatar_url ||
    offer?.seller?.avatar_url ||
    offer?.seller?.avatarUrl ||
    null;

  const galleryImages = useMemo(() => {
    const list = [
      normalizeImageSrc(offer?.image),
      normalizeImageSrc(offer?.imageUrl || offer?.image_url),
      ...(Array.isArray(offer?.images) ? offer.images.map((img) => normalizeImageSrc(img)) : []),
      ...(Array.isArray(offer?.image_urls) ? offer.image_urls.map((img) => normalizeImageSrc(img)) : []),
    ].filter(Boolean);

    return list.filter((src, idx) => list.indexOf(src) === idx);
  }, [offer]);

  useEffect(() => {
    setActiveImage(0);
  }, [offerId, galleryImages.length]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
          <Link to="/buyer/home" className="text-yellow-600 hover:text-yellow-500">
            Home
          </Link>
          <span className="text-slate-400">/</span>
          <Link to="/buyer/offers" className="text-yellow-600 hover:text-yellow-500">
            Offer
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-700">{title}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => navigate("/buyer/home")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow-sm hover:border-slate-300"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back
          </button>
          {interestChecked && <InterestBadge interested={isInterested} />}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="h-[360px] w-full animate-pulse rounded-3xl bg-slate-100 sm:h-[420px] lg:h-[560px]" />
            <div className="flex gap-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 w-24 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
          <div className="space-y-4 lg:col-span-5">
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
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
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-slate-100 sm:h-[420px] lg:h-[560px]">
                {galleryImages.length ? (
                  <img
                    src={galleryImages[activeImage]}
                    alt={title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {(galleryImages.length ? galleryImages : [null]).slice(0, 3).map((src, idx) => (
                  <button
                    key={src || idx}
                    type="button"
                    onClick={() => src && setActiveImage(idx)}
                    className={`relative h-20 w-24 overflow-hidden rounded-xl border ${
                      activeImage === idx ? "border-yellow-400 ring-2 ring-yellow-200" : "border-slate-200"
                    } bg-white`}
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={`${title} thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                        Thumbnail
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 lg:col-span-5">
              <div className="space-y-2">
                <StatusBadge status={offer?.status} />
                <h1 className="text-4xl font-extrabold text-slate-900 md:text-5xl">{title}</h1>
                <p className="text-sm font-semibold text-slate-500">Offer ID: {offer?.id || EMPTY_PLACEHOLDER}</p>
                <p className="text-base leading-relaxed text-slate-700">{description}</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="grid grid-cols-2 divide-x divide-slate-200">
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{quantityValue}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
                    <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <FiDollarSign className="h-5 w-5 text-yellow-500" />
                      {priceValue}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200">
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Incoterm</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{sellerIncoterm || EMPTY_PLACEHOLDER}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CRD</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{crdValue}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-base font-semibold text-yellow-700">
                    {sellerAvatar ? (
                      <img
                        src={sellerAvatar}
                        alt={sellerName}
                        className="h-full w-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      sellerName?.charAt(0)?.toUpperCase() || "S"
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seller</p>
                    <p className="text-lg font-semibold text-slate-900">{sellerName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-yellow-300 px-3 py-2 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-50"
                >
                  View Profile
                </button>
              </div>

              <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
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

                <button
                  type="button"
                  onClick={handleExpressInterest}
                  disabled={actionDisabled || isInterested}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold shadow-sm transition ${
                    expressInterestLoading ? "cursor-wait" : ""
                  } ${
                    isInterested
                      ? "bg-slate-100 text-slate-500"
                      : "bg-yellow-400 text-slate-900 hover:bg-yellow-300"
                  } ${actionDisabled ? "opacity-80 cursor-not-allowed" : ""}`}
                >
                  {expressInterestLoading ? (
                    <>
                      <FiLoader className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="h-5 w-5" />
                      Interest Offer
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/buyer/service-requests/new?offerId=${offerId}`)}
                  disabled={!isInterested || actionDisabled}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition ${
                    !isInterested || actionDisabled
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <FiSend className="h-5 w-5" />
                  Send Service Request
                </button>
                {!isInterested && (
                  <p className="text-xs text-slate-500">
                    Express interest to unlock the service request form for this offer.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {isInterested ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <FiMapPin className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Port of Loading</p>
                    <p className="text-sm font-semibold text-slate-900">{offer?.port_of_loading || EMPTY_PLACEHOLDER}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <FiGlobe className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Terms</p>
                    <p className="text-sm font-semibold text-slate-900">{offer?.payment_terms || EMPTY_PLACEHOLDER}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <FiAlertCircle className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created At</p>
                    <p className="text-sm font-semibold text-slate-900">{formatDate(offer?.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <FiAlertCircle className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Updated At</p>
                    <p className="text-sm font-semibold text-slate-900">{formatDate(offer?.updated_at)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-slate-800">
                <FiAlertCircle className="mt-0.5 h-5 w-5 text-yellow-500" />
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">Details locked</h2>
                  <p className="text-sm text-slate-700">
                    Basic offer info is shown above. Express interest to view full logistics, seller details, and send a service request.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerOfferDetailPage;
