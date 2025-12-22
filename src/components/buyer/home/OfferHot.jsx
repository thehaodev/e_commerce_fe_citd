import { useNavigate } from "react-router-dom";
import { mockHotOffers } from "../../../data/buyerHomeMock";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
};

const OfferHot = ({
  offers = [],
  isLoading = false,
  error = null,
  interestedOfferIds = new Set(),
  submittingOfferId = null,
  onExpressInterest,
}) => {
  const navigate = useNavigate();
  const hasApiData = Array.isArray(offers) && offers.length > 0;
  const list = hasApiData ? offers : mockHotOffers;
  const showSkeleton = isLoading && hasApiData;

  const renderSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101d34] to-[#152743] p-5 text-white shadow-lg animate-pulse"
        >
          <div className="mb-4 h-6 w-24 rounded-full bg-white/20" />
          <div className="h-5 w-16 rounded-full bg-white/20" />
          <div className="mt-4 h-5 w-3/4 rounded bg-white/20" />
          <div className="mt-2 h-4 w-full rounded bg-white/20" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">Offer HOT</p>
          <h2 className="relative inline-block text-2xl font-semibold text-gray-900 after:absolute after:-bottom-2 after:left-0 after:h-1 after:w-16 after:rounded-full after:bg-yellow-300">
            Trending right now
          </h2>
        </div>
      </div>

      {error && hasApiData && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {showSkeleton ? (
        renderSkeleton()
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {list.map((offer, idx) => {
            const hasId = Boolean(offer?.id);
            const badge = offer?.seller_incoterm || offer?.badge || "Hot deal";
            const discountLabel =
              offer?.discountText ||
              (typeof offer?.discount_percentage === "number"
                ? `Up to ${offer.discount_percentage}% OFF`
                : offer?.discount || "Up to 25% OFF");
            const title = offer?.product_name || offer?.title || offer?.name || "Untitled offer";
            const description =
              offer?.subtitle || offer?.description || offer?.port_of_loading || "No description";
            const priceLabel = offer?.price || discountLabel;
            const dateLabel = formatDate(offer?.created_at || offer?.createdAt);
            const isInterested = interestedOfferIds.has(String(offer?.id));
            const isSubmitting = submittingOfferId === offer?.id;
            const buttonLabel = isInterested ? "Interested" : isSubmitting ? "Submitting..." : "Express interest";
            const imageUrl =
              offer?.imageUrl ||
              (Array.isArray(offer?.images) && offer.images[0]?.url) ||
              (Array.isArray(offer?.images) && typeof offer.images[0] === "string" ? offer.images[0] : null);

            return (
              <div
                key={offer?.id || idx}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101d34] via-[#0f243f] to-[#172f52] p-6 text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent)]" />
                {imageUrl && (
                  <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    <img src={imageUrl} alt={title} className="h-full w-full object-cover opacity-80" />
                  </div>
                )}
                <div className="relative flex items-start justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-200 ring-1 ring-white/15">
                    {badge}
                  </span>
                  <span className="rounded-full bg-yellow-300 px-3 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">
                    {priceLabel}
                  </span>
                </div>
                <div className="relative mt-4 flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-semibold text-yellow-200">{discountLabel}</p>
                    <h3 className="text-lg font-bold leading-tight">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-200 line-clamp-3">{description}</p>
                    <div className="text-[11px] font-semibold text-slate-300/80">
                      {dateLabel ? `Posted ${dateLabel}` : "Hot pick"}
                    </div>
                  </div>
                  <div className="hidden h-16 w-16 flex-none items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-yellow-200 ring-1 ring-white/10 sm:flex">
                    HOT
                  </div>
                </div>
                <div className="relative mt-5 flex flex-col gap-2 sm:flex-row">
                  {hasId && (
                    <button
                      type="button"
                      onClick={() => navigate(`/buyer/offers/${offer.id}`)}
                      className="inline-flex items-center justify-center rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
                    >
                      View details
                    </button>
                  )}
                  {hasId && onExpressInterest && (
                    <button
                      type="button"
                      disabled={isInterested || isSubmitting}
                      onClick={() => {
                        if (isInterested || isSubmitting || !offer?.id) return;
                        onExpressInterest?.(offer.id);
                      }}
                      className={`inline-flex items-center justify-center rounded-full bg-yellow-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:-translate-y-px hover:shadow ${
                        isInterested || isSubmitting ? "cursor-not-allowed opacity-70" : ""
                      }`}
                    >
                      {buttonLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default OfferHot;
