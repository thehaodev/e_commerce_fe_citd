import React from "react";

const Pagination = ({ page, pageCount, onPageChange }) => {
  if (!pageCount || pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-amber-300 disabled:opacity-50"
      >
        Prev
      </button>
      <div className="flex items-center gap-2">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-9 w-9 rounded-full text-sm font-semibold ${
              p === page
                ? "bg-amber-500 text-slate-900 shadow"
                : "bg-white border border-slate-200 text-slate-700 hover:border-amber-300"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-amber-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
