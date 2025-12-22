import { useNavigate } from "react-router-dom";
import { mockNewOffers } from "../../../data/buyerHomeMock";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
};

const getImageUrl = (offer) => {
  if (offer?.imageUrl) return offer.imageUrl;
  if (!offer?.images) return null;
  const firstImage = Array.isArray(offer.images) ? offer.images[0] : null;
  if (!firstImage) return null;
  return typeof firstImage === "string" ? firstImage : firstImage.url || null;
};

const NewOffers = ({
  offers = [],
  isLoading = false,
  error = null,
  interestedOfferIds = new Set(),
  submittingOfferId = null,
  onExpressInterest,
}) => {
  const navigate = useNavigate();
  const hasApiData = Array.isArray(offers) && offers.length > 0;
  const list = hasApiData ? offers : mockNewOffers;
  const showSkeleton = isLoading && hasApiData;

  const renderSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="flex flex-col overflow-hidden rounded-2xl border border-amber-50 bg-white p-4 shadow-sm animate-pulse"
        >
          <div className="mb-4 h-40 w-full rounded-xl bg-amber-100" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-amber-100" />
            <div className="h-3 w-1/2 rounded bg-amber-100" />
            <div className="h-4 w-1/3 rounded bg-amber-100" />
            <div className="h-3 w-1/4 rounded bg-amber-100" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">New Offer</p>
          <h2 className="relative inline-block text-2xl font-semibold text-gray-900 after:absolute after:-bottom-2 after:left-0 after:h-1 after:w-16 after:rounded-full after:bg-yellow-300">
            Fresh arrivals
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((offer, idx) => {
            const imageUrl = getImageUrl(offer);
            const readyDate = formatDate(offer?.cargo_ready_date);
            const createdDate = formatDate(offer?.created_at || offer?.createdAt);
            const title = offer?.product_name || offer?.name || "Untitled offer";
            const isInterested = interestedOfferIds.has(String(offer?.id));
            const isSubmitting = submittingOfferId === offer?.id;
            const buttonLabel = isInterested ? "Interested" : isSubmitting ? "Submitting..." : "Express interest";
            return (
              <div
                key={offer?.id || idx}
                onClick={() => offer?.id && navigate(`/buyer/offers/${offer.id}`)}
                className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  idx === 0 ? "border-yellow-300 shadow-md" : "border-amber-50"
                }`}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={offer?.product_name || "Offer image"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-amber-50 text-sm font-semibold text-amber-700">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {offer?.description || offer?.subtitle || "No description"}
                  </p>
                  <p className="mt-2 text-base font-bold text-gray-900">
                    {offer?.price ?? "Price on request"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    {readyDate ? `Cargo ready: ${readyDate}` : createdDate ? `Posted: ${createdDate}` : "Just added"}
                  </p>
                  <div className="mt-auto flex flex-col gap-2 pt-3">
                    {offer?.id && onExpressInterest && (
                      <button
                        type="button"
                        disabled={isInterested || isSubmitting}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isInterested || isSubmitting || !offer?.id) return;
                          onExpressInterest?.(offer.id);
                        }}
                        className={`w-full rounded-full bg-yellow-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:-translate-y-px hover:shadow ${
                          isInterested || isSubmitting ? "cursor-not-allowed opacity-70" : ""
                        }`}
                      >
                        {buttonLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default NewOffers;
