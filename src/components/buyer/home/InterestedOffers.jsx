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

const InterestedOffers = ({ offers = [], isLoading = false, error = null }) => {
  const renderSkeleton = () => (
    <div className="-mx-2 flex gap-4 overflow-x-auto pb-2">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="min-w-[260px] max-w-xs flex-1 animate-pulse rounded-2xl border border-amber-50 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 h-36 w-full rounded-xl bg-amber-100" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-amber-100" />
            <div className="h-3 w-1/2 rounded bg-amber-100" />
            <div className="h-4 w-1/3 rounded bg-amber-100" />
            <div className="flex gap-2">
              <span className="h-6 w-16 rounded-full bg-amber-100" />
              <span className="h-6 w-16 rounded-full bg-amber-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">Your Offer Interested</p>
          <h2 className="text-xl font-bold text-gray-900">Picked for you</h2>
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
        <div className="-mx-2 flex gap-4 overflow-x-auto pb-2">
          {offers.map((offer) => {
            const imageUrl = getImageUrl(offer);
            const tags = [
              offer?.seller_incoterm,
              offer?.port_of_loading,
              formatDate(offer?.cargo_ready_date),
            ].filter(Boolean);

            return (
              <div
                key={offer?.id}
                className="min-w-[260px] max-w-xs flex-1 rounded-2xl border border-amber-50 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-36 w-full overflow-hidden rounded-t-2xl">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {offer?.product_name || "Unnamed offer"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {offer?.description || "No description"}
                  </p>
                  <p className="text-base font-bold text-amber-700">
                    {offer?.price ?? "Price on request"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.length ? (
                      tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] font-semibold text-gray-400">No tags</span>
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

export default InterestedOffers;
