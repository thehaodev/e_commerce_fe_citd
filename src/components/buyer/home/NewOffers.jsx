import { newOffers } from "../../../data/buyerHomeMock";

const NewOffers = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">New Offer</p>
          <h2 className="text-xl font-bold text-gray-900">Fresh arrivals</h2>
        </div>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          View all
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {newOffers.map((offer) => (
          <div
            key={offer.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={offer.image}
                alt={offer.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-sm font-semibold text-gray-900">{offer.title}</p>
              <p className="text-xs text-gray-500">{offer.supplier}</p>
              <p className="mt-2 text-base font-bold text-indigo-600">{offer.price}</p>
              <p className="mt-1 text-xs font-semibold text-gray-500">{offer.moq}</p>
              <div className="mt-auto pt-3">
                <button className="w-full rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100">
                  See details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewOffers;
