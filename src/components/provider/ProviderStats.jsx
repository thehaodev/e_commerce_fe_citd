import React from "react";

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-1">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-3xl font-bold text-slate-900">{value}</span>
  </div>
);

/**
 * @param {Object} props
 * @param {number} props.totalPrivateOffers
 * @param {number} props.totalProposals
 * @param {number} props.awardedProposals
 * @param {number} props.rejectedOrExpiredProposals
 * @param {number} [props.openServiceRequests]
 */
const ProviderStats = ({
  totalPrivateOffers,
  totalProposals,
  awardedProposals,
  rejectedOrExpiredProposals,
  openServiceRequests,
}) => {
  const stats = [
    {
      key: "open-requests",
      label: "Open Service Requests",
      value: openServiceRequests ?? 0,
    },
    {
      key: "private-offers",
      label: "Private Offers Created",
      value: totalPrivateOffers ?? 0,
    },
    {
      key: "proposals-sent",
      label: "Proposals Sent",
      value: totalProposals ?? 0,
    },
    {
      key: "awarded",
      label: "Awarded Proposals",
      value: awardedProposals ?? 0,
    },
    {
      key: "rejected-expired",
      label: "Rejected / Expired",
      value: rejectedOrExpiredProposals ?? 0,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => (
        <StatCard key={stat.key} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
};

export default ProviderStats;
