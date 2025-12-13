import React, { useMemo } from "react";
import { FiAlertCircle, FiArrowRight, FiRefreshCw, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useProviderServiceRequests from "../../hooks/useProviderServiceRequests";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const ProviderServiceRequestsPage = () => {
  const navigate = useNavigate();
  const { requests, isLoading, error, refresh } = useProviderServiceRequests({ offerLimit: 10 });

  const rows = useMemo(
    () =>
      requests.map((item) => ({
        ...item,
        offerDisplay: [item.offerCode, item.offerProductName].filter(Boolean).join(" · "),
      })),
    [requests]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Provider
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
          <p className="text-sm text-slate-600">
            Aggregated from active/open offers (showing the first 10 offers to keep things fast).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Incoming Service Requests</h2>
            <p className="text-sm text-slate-600">
              Built from active offers. Create private offers or jump into request details.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            Showing {rows.length} request{rows.length === 1 ? "" : "s"}
          </div>
        </div>

        {isLoading ? (
          <div className="overflow-hidden rounded-b-2xl border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-3 text-left">Request</th>
                  <th className="px-3 py-3 text-left">Offer</th>
                  <th className="px-3 py-3 text-left">Incoterm</th>
                  <th className="px-3 py-3 text-left">Destination</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-3">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 border-t border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <FiAlertCircle className="mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Could not load service requests.</p>
              <p className="text-xs text-rose-600">{error}</p>
              <button
                type="button"
                onClick={refresh}
                className="text-xs font-semibold text-rose-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="border-t border-dashed border-slate-200 px-6 py-10 text-center">
            <FiSearch className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="text-lg font-semibold text-slate-900 mb-2">
              No service requests needing your attention.
            </p>
            <p className="text-sm text-slate-600">
              Browse active offers to find opportunities to serve buyers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-3 text-left">Request</th>
                  <th className="px-3 py-3 text-left">Offer</th>
                  <th className="px-3 py-3 text-left">Incoterm</th>
                  <th className="px-3 py-3 text-left">Destination</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      {req.id ? `SR #${req.id}` : "Service Request"}
                    </td>
                    <td className="px-3 py-3 text-slate-800">
                      <div className="flex flex-col">
                        <span className="font-semibold">{req.offerDisplay || req.offerId}</span>
                        {req.offer?.sellerIncoterm && (
                          <span className="text-xs text-slate-500">
                            Seller incoterm: {req.offer.sellerIncoterm}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {req.incotermBuyer || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{req.destination}</td>
                    <td className="px-3 py-3 text-slate-600">{formatDate(req.createdAt)}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {req.status || "REQUESTED"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/provider/service-requests/${req.id}`)}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                          View details
                          <FiArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={!req.offerId}
                          onClick={() =>
                            navigate(
                              `/provider/private-offers/new?offerId=${req.offerId}&serviceRequestId=${req.id}`
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Create Private Offer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderServiceRequestsPage;
