import React from "react";

const SortDropdown = ({ value, onChange }) => {
  const options = [
    { value: "created_desc", label: "Created (newest)" },
    { value: "created_asc", label: "Created (oldest)" },
    { value: "crd_asc", label: "CRD (soonest)" },
    { value: "crd_desc", label: "CRD (latest)" },
    { value: "status", label: "Status" },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SortDropdown;
