import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiArrowRight, FiImage } from "react-icons/fi";
import StatusBadge from "../../components/seller/offers/StatusBadge";
import { getOfferById } from "../../api/offerApi";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const Banner = ({ status, reason }) => {
  if (status === "OPEN") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
        <FiAlertCircle className="mt-0.5" /> Waiting for admin approval.
      </div>
    );
  }
  if (status === "ACTIVE") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-start gap-2">
        <FiAlertCircle className="mt-0.5" /> Offer is live.
      </div>
    );
  }
  if (status === "LOCKED") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 space-y-1">
        <div className="flex items-start gap-2">
          <FiAlertCircle className="mt-0.5" /> Offer locked.
        </div>
        {reason && <p className="text-sm text-rose-700">Reason: {reason}</p>}
      </div>
    );
  }
  return null;
};

const OfferDetailPage = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getOfferById(offerId);
        const data = res?.data || res;
        if (isMounted) {
          setOffer(data);
          setActiveIndex(0);
        }
      } catch (err) {
        if (isMounted) setError(err?.message || "Unable to load offer.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [offerId]);

  const images = useMemo(() => {
    if (!offer?.images) return [];
    return Array.isArray(offer.images) ? offer.images : [];
  }, [offer]);

  const activeImage = images[activeIndex] || null;

  const infoItem = (label, value) => (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900">{value || "N/A"}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white/90 backdrop-blur px-6 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/seller/offers")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-amber-700"
        >
          <FiArrowLeft /> Back to My Offers
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Offer Detail
          </p>
          <h1 className="text-2xl font-bold text-slate-900">{offer?.product_name || "N/A"}</h1>
        </div>
        {offer?.status && <StatusBadge status={offer.status} className="ml-auto" />}
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse space-y-4">
            <div className="h-6 w-64 bg-slate-200 rounded" />
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        ) : (
          <>
            <Banner status={offer?.status} reason={offer?.lock_reason || offer?.reason} />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              {images.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt="Offer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-500">
                        <FiImage size={32} />
                      </div>
                    )}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-slate-50"
                        >
                          <FiArrowLeft />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-slate-50"
                        >
                          <FiArrowRight />
                        </button>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveIndex(idx)}
                          className={`h-16 w-20 rounded-lg overflow-hidden border ${
                            idx === activeIndex
                              ? "border-amber-400 ring-2 ring-amber-200"
                              : "border-slate-200"
                          }`}
                        >
                          <img src={img} alt={`thumb-${idx}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500">
                  No images provided.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Product</h3>
                {infoItem("Product name", offer?.product_name)}
                {infoItem("Description", offer?.description)}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Commercial</h3>
                {infoItem("Quantity", offer?.quantity)}
                {infoItem("Price", offer?.price)}
                {infoItem("Incoterm", offer?.seller_incoterm)}
                {infoItem("Payment terms", offer?.payment_terms)}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Logistics</h3>
                {infoItem("Port of loading", offer?.port_of_loading)}
                {infoItem("Cargo ready date", formatDate(offer?.cargo_ready_date))}
                {infoItem("Status", offer?.status)}
                {infoItem("Created at", formatDate(offer?.created_at || offer?.createdAt))}
                {infoItem("Updated at", formatDate(offer?.updated_at || offer?.updatedAt))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OfferDetailPage;
