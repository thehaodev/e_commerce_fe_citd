import React from "react";

const statusOptions = ["OPEN", "ACTIVE", "LOCKED"];

const FilterBar = ({
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  search,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        {statusOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onStatusChange(option === status ? "" : option)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              status === option
                ? "bg-amber-500/10 text-amber-700 border-amber-400"
                : "bg-white text-slate-700 border-slate-200 hover:border-amber-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-700">From</label>
        <input
          type="date"
          value={dateRange?.from || ""}
          onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
        <label className="text-sm font-semibold text-slate-700">To</label>
        <input
          type="date"
          value={dateRange?.to || ""}
          onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="flex-1 min-w-[220px]">
        <input
          type="text"
          placeholder="Search by product name"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
      </div>
    </div>
  );
};

export default FilterBar;
