import React from "react";

const styles = {
  OPEN: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  LOCKED: "bg-rose-100 text-rose-700",
};

const StatusBadge = ({ status, className = "" }) => {
  const base =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold";
  const tone = styles[status] || "bg-slate-100 text-slate-700";

  return <span className={`${base} ${tone} ${className}`}>{status}</span>;
};

export default StatusBadge;
