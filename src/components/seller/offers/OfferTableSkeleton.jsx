import React from "react";

const OfferTableSkeleton = () => {
  const rows = Array.from({ length: 5 });
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
      <div className="animate-pulse divide-y divide-slate-100">
        {rows.map((_, idx) => (
          <div key={idx} className="grid grid-cols-10 gap-3 px-4 py-3">
            {Array.from({ length: 10 }).map((__, col) => (
              <div
                key={col}
                className="h-4 rounded-full bg-slate-200"
                style={{ width: ["10%", "18%", "12%", "12%", "10%", "10%", "12%", "12%", "10%", "12%"][col] || "100%" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfferTableSkeleton;
