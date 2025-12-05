import { categories } from "../../../data/buyerHomeMock";

const TopCategories = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">Top Categories</p>
          <h2 className="text-xl font-bold text-gray-900">Explore by industry</h2>
        </div>
        <button className="text-sm font-semibold text-amber-700 hover:text-amber-800">
          See all
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center gap-2 rounded-2xl border border-amber-50 bg-white px-3 py-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${category.color}`}
            >
              {category.name.slice(0, 2)}
            </div>
            <p className="text-xs font-semibold text-gray-800">{category.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopCategories;
