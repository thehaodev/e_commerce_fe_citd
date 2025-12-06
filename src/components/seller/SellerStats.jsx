import React from "react";

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
    <p className="text-sm text-slate-500 font-semibold">{label}</p>
    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
  </div>
);

const SellerStats = ({ total, open, active, locked, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 animate-pulse"
          >
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-8 w-16 rounded bg-slate-200 mt-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Offers" value={total} />
      <StatCard label="OPEN" value={open} />
      <StatCard label="ACTIVE" value={active} />
      <StatCard label="LOCKED" value={locked} />
    </div>
  );
};

export default SellerStats;
