import { hotOffers } from "../../../data/buyerHomeMock";

const OfferHot = () => {
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

      <div className="-mx-2 flex gap-4 overflow-x-auto pb-2">
        {hotOffers.map((offer) => (
          <div
            key={offer.id}
            className="relative min-w-[280px] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-300 p-5 text-gray-900 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative flex items-start justify-between">
              <span className="rounded-full bg-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-900">
                {offer.badge}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                {offer.discount}
              </span>
            </div>
            <h3 className="relative mt-4 text-lg font-bold text-gray-900">{offer.title}</h3>
            <p className="relative mt-2 text-sm text-amber-900/80">
              {offer.description}
            </p>
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
        ))}
      </div>
    </section>
  );
};

export default OfferHot;
