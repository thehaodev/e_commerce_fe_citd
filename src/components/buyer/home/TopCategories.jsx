import { mockTopCategories } from "../../../data/buyerHomeMock";

const TopCategories = ({ categories = mockTopCategories }) => {
  const list = categories && categories.length ? categories : mockTopCategories;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-amber-700">Top Categories</p>
        <button
          type="button"
          className="text-xs font-semibold text-gray-700 transition hover:text-gray-900"
        >
          View All &gt;
        </button>
      </div>

      <div className="mb-4 h-px w-full bg-gray-200" />

      <div className="flex h-auto w-full items-center justify-start gap-6 overflow-x-auto pb-2 md:h-28 md:gap-0 md:overflow-visible md:justify-between">
        {list.map((category, idx) => (
          <div
            key={category.id}
            className="flex flex-none flex-col items-center justify-center text-center sm:w-28 md:h-full md:flex-1 md:w-auto"
          >
            <div
              className={`h-20 w-20 overflow-hidden rounded-full shadow-sm ring-2 ring-offset-2 md:h-[85%] md:w-auto md:aspect-square ${
                idx === 0 ? "ring-blue-500" : "ring-transparent"
              }`}
            >
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-[11px] font-semibold text-gray-500">
                  {category.name.slice(0, 2)}
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-slate-700 line-clamp-2">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopCategories;
