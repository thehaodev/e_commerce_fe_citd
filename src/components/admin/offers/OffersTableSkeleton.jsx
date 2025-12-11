import React from "react";

const OffersTableSkeleton = () => {
  const rows = Array.from({ length: 5 });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((_, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-4">
            <div className="col-span-2 h-4 rounded bg-slate-200 animate-pulse" />
            <div className="col-span-2 h-4 rounded bg-slate-200 animate-pulse" />
            <div className="col-span-2 h-4 rounded bg-slate-200 animate-pulse" />
            <div className="col-span-2 h-4 rounded bg-slate-200 animate-pulse" />
            <div className="col-span-2 h-4 rounded bg-slate-200 animate-pulse" />
            <div className="col-span-2 h-4 rounded bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersTableSkeleton;

