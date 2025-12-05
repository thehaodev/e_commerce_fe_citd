import { hotOffers } from "../../../data/buyerHomeMock";

const OfferHot = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Offer HOT</p>
          <h2 className="text-xl font-bold text-gray-900">Trending right now</h2>
        </div>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          See more
        </button>
      </div>

      <div className="-mx-2 flex gap-4 overflow-x-auto pb-2">
        {hotOffers.map((offer) => (
          <div
            key={offer.id}
            className="relative min-w-[280px] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-400 p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative flex items-start justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {offer.badge}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
                {offer.discount}
              </span>
            </div>
            <h3 className="relative mt-4 text-lg font-bold">{offer.title}</h3>
            <p className="relative mt-2 text-sm text-indigo-50">
              {offer.description}
            </p>
            <button className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:translate-x-1">
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
