import { interestedOffers } from "../../../data/buyerHomeMock";

const InterestedOffers = () => {
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

      <div className="-mx-2 flex gap-4 overflow-x-auto pb-2">
        {interestedOffers.map((offer) => (
          <div
            key={offer.id}
            className="min-w-[260px] max-w-xs flex-1 rounded-2xl border border-amber-50 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-36 w-full overflow-hidden rounded-t-2xl">
              <img
                src={offer.image}
                alt={offer.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-sm font-semibold text-gray-900">{offer.title}</p>
              <p className="text-xs text-gray-500">{offer.supplier}</p>
              <p className="text-base font-bold text-amber-700">{offer.price}</p>
              <div className="flex flex-wrap gap-2">
                {offer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InterestedOffers;
