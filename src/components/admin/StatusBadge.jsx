import React from "react";

const STATUS_STYLES = {
  OPEN: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Active", className: "bg-emerald-100 text-emerald-700" },
  LOCKED: { label: "Locked", className: "bg-slate-200 text-slate-700" },
  DELETED: { label: "Rejected", className: "bg-rose-100 text-rose-700" },
};

const StatusBadge = ({ status }) => {
  const info =
    STATUS_STYLES[status] || { label: status || "Unknown", className: "bg-slate-100 text-slate-700" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${info.className}`}
    >
      {info.label}
    </span>
  );
};

export default StatusBadge;

