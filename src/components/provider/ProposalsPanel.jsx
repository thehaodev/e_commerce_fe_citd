import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  AWARDED: "bg-emerald-100 text-emerald-700",
  PROPOSAL_SENT: "bg-amber-100 text-amber-700",
  REJECTED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-slate-200 text-slate-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
      statusStyles[status] || "bg-slate-100 text-slate-700"
    }`}
  >
    {status}
  </span>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-32" />
    </td>
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-24" />
    </td>
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-16" />
    </td>
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-20" />
    </td>
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-16" />
    </td>
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-20" />
    </td>
    <td className="px-3 py-3">
      <div className="h-9 bg-slate-200 rounded" />
    </td>
  </tr>
);

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PROPOSAL_SENT", label: "Sent" },
  { key: "AWARDED", label: "Awarded" },
  { key: "REJECTED", label: "Rejected" },
  { key: "EXPIRED", label: "Expired" },
];

/**
 * @typedef {Object} Proposal
 * @property {string} id
 * @property {string} offer_id
 * @property {string} service_request_id
 * @property {string} service_fee
 * @property {string} total_cost
 * @property {number} lead_time
 * @property {string} eta
 * @property {string} service_conditions
 * @property {string} extra_charges
 * @property {string | null} [provider_notes]
 * @property {"PROPOSAL_SENT" | "AWARDED" | "REJECTED" | "EXPIRED"} status
 * @property {string} created_at
 */

/**
 * @param {Object} props
 * @param {boolean} props.isLoading
 * @param {string | null} props.error
 * @param {Proposal[]} props.proposals
 */
const ProposalsPanel = ({ isLoading, error, proposals }) => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredProposals = useMemo(() => {
    return proposals
      ?.filter((proposal) => {
        if (statusFilter !== "ALL" && proposal.status !== statusFilter) {
          return false;
        }
        if (!searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase();
        return (
          proposal.offer_id?.toLowerCase().includes(query) ||
          proposal.service_request_id?.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [proposals, searchTerm, statusFilter]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My Proposals</h2>
          <p className="text-sm text-slate-500">
            Monitor proposals you have sent to buyers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                statusFilter === filter.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
              onClick={() => setStatusFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search product or buyer"
            className="w-full sm:w-60 bg-white border border-slate-300 rounded-full px-4 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-amber-300 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <span className="text-sm">{error}</span>
          <button
            type="button"
            className="text-sm font-semibold text-rose-800 underline"
            onClick={() => navigate(0)}
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wide text-xs">
              <tr>
                <th className="text-left px-3 py-3">Offer</th>
                <th className="text-left px-3 py-3">Destination</th>
                <th className="text-left px-3 py-3">Service Fee</th>
                <th className="text-left px-3 py-3">Total Cost</th>
                <th className="text-left px-3 py-3">Lead Time</th>
                <th className="text-left px-3 py-3">ETA</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Created</th>
                <th className="text-left px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(4)].map((_, idx) => (
                <SkeletonRow key={idx} />
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredProposals?.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wide text-xs">
              <tr>
                <th className="text-left px-3 py-3">Offer</th>
                <th className="text-left px-3 py-3">Destination</th>
                <th className="text-left px-3 py-3">Service Fee</th>
                <th className="text-left px-3 py-3">Total Cost</th>
                <th className="text-left px-3 py-3">Lead Time</th>
                <th className="text-left px-3 py-3">ETA</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Created</th>
                <th className="text-left px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    proposal.status === "AWARDED" ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <td className="px-3 py-3 text-slate-900 font-medium">
                    {proposal.offer_id}
                    <div className="text-xs text-slate-500">
                      SR #{proposal.service_request_id}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">Destination TBD</td>
                  <td className="px-3 py-3 text-slate-700">
                    {proposal.service_fee || "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {proposal.total_cost || "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {proposal.lead_time ? `${proposal.lead_time} days` : "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {proposal.eta
                      ? new Date(proposal.eta).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={proposal.status} />
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {new Date(proposal.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm shadow-sm"
                      onClick={() =>
                        navigate(`/provider/proposals/${proposal.id}`)
                      }
                    >
                      View Proposal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center">
          <div className="text-slate-700 font-semibold mb-2">
            No proposals yet.
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Send a proposal after creating a private offer.
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm shadow-sm"
            onClick={() => navigate("/provider/private-offers")}
          >
            View Private Offers
          </button>
        </div>
      )}
    </div>
  );
};

export default ProposalsPanel;
