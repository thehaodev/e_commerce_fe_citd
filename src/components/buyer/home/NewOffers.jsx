const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
};

const getImageUrl = (offer) => {
  if (!offer?.images) return null;
  const firstImage = Array.isArray(offer.images) ? offer.images[0] : null;
  if (!firstImage) return null;
  return typeof firstImage === "string" ? firstImage : firstImage.url || null;
};

const NewOffers = ({ offers = [], isLoading = false, error = null }) => {
  const renderSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((idx) => (
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
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">New Offer</p>
          <h2 className="text-xl font-bold text-gray-900">Fresh arrivals</h2>
        </div>
        <button className="text-sm font-semibold text-amber-700 hover:text-amber-800">
          View all
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((offer) => {
            const imageUrl = getImageUrl(offer);
            const readyDate = formatDate(offer?.cargo_ready_date);
            const createdDate = formatDate(offer?.created_at || offer?.createdAt);
            return (
              <div
                key={offer?.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-amber-50 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={offer?.product_name || "Offer image"}
                      className="h-full w-full object-cover"
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
                    {offer?.product_name || "Untitled offer"}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {offer?.description || "No description"}
                  </p>
                  <p className="mt-2 text-base font-bold text-amber-700">
                    {offer?.price ?? "Price on request"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    {readyDate ? `Cargo ready: ${readyDate}` : createdDate ? `Posted: ${createdDate}` : "Just added"}
                  </p>
                  <div className="mt-auto pt-3">
                    <button className="w-full rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100">
                      See details
                    </button>
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
