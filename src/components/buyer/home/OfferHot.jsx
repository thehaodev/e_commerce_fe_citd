const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
};

const OfferHot = ({ offers = [], isLoading = false, error = null }) => {
  const renderSkeleton = () => (
    <div className="-mx-2 flex gap-4 overflow-x-auto pb-2">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="relative min-w-[280px] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-50 p-5 text-gray-900 shadow-lg animate-pulse"
        >
          <div className="mb-4 h-6 w-24 rounded-full bg-amber-200" />
          <div className="h-5 w-16 rounded-full bg-amber-200" />
          <div className="mt-4 h-5 w-3/4 rounded bg-amber-200" />
          <div className="mt-2 h-4 w-full rounded bg-amber-200" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">Offer HOT</p>
          <h2 className="text-xl font-bold text-gray-900">Trending right now</h2>
        </div>
        <button className="text-sm font-semibold text-amber-700 hover:text-amber-800">
          See more
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        renderSkeleton()
      ) : offers.length === 0 ? (
        <p className="text-sm text-gray-500">No offers available at the moment.</p>
      ) : (
        <div className="-mx-2 flex gap-4 overflow-x-auto pb-2">
          {offers.map((offer) => {
            const badge = offer?.seller_incoterm || "Active offer";
            const priceLabel = offer?.price ? `${offer.price}` : "Price on request";
            const dateLabel = formatDate(offer?.created_at || offer?.createdAt);
            const description = offer?.description || offer?.port_of_loading || "No description";

            return (
              <div
                key={offer?.id}
                className="relative min-w-[280px] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-300 p-5 text-gray-900 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent)]" />
                <div className="relative flex items-start justify-between">
                  <span className="rounded-full bg-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-900">
                    {badge}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                    {priceLabel}
                  </span>
                </div>
                <h3 className="relative mt-4 text-lg font-bold text-gray-900">
                  {offer?.product_name || "Untitled offer"}
                </h3>
                <p className="relative mt-2 text-sm text-amber-900/80">
                  {description}
                </p>
                <div className="relative mt-3 text-xs font-semibold text-amber-900/70">
                  {dateLabel ? `Posted ${dateLabel}` : "Recently added"}
                </div>
                <button className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition hover:translate-x-1">
                  Grab deal
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 12h14m-7-7l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default OfferHot;
