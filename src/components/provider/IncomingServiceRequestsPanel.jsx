import React from "react";

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
    {children}
  </span>
);

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-slate-100 bg-slate-50/60 p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-2">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-3 w-64 rounded bg-slate-200" />
      </div>
      <div className="h-6 w-24 rounded-full bg-slate-200" />
    </div>
    <div className="mt-3 h-9 w-full rounded-lg bg-slate-200" />
  </div>
);

/**
 * @typedef {Object} ServiceRequest
 * @property {string} id
 * @property {string} offerId
 * @property {string} offerProductName
 * @property {string} [buyerName]
 * @property {"CFR" | "CIF" | "DAP" | "DDP"} incotermBuyer
 * @property {string} destination
 * @property {string} createdAt
 * @property {string} status
 */

/**
 * @param {Object} props
 * @param {boolean} props.isLoading
 * @param {string | null} props.error
 * @param {ServiceRequest[]} props.serviceRequests
 * @param {() => void} [props.onRetry]
 * @param {(id: string) => void} [props.onOpenDetail]
 * @param {(id: string, offerId: string) => void} [props.onCreatePrivateOffer]
 * @param {() => void} [props.onBrowseOffers]
 */
const IncomingServiceRequestsPanel = ({
  isLoading,
  error,
  serviceRequests,
  onRetry,
  onOpenDetail,
  onCreatePrivateOffer,
  onBrowseOffers,
}) => {
  const list = serviceRequests?.slice(0, 5) || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Incoming Service Requests</h2>
          <p className="text-sm text-slate-500">
            Recent requests from active offers. Create a private offer to respond.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold"
            onClick={() => onRetry?.()}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <span className="text-sm">{error || "Could not load service requests."}</span>
          {onRetry && (
            <button
              type="button"
              className="text-sm font-semibold text-rose-800 underline"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : list.length ? (
        <div className="space-y-3">
          {list.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:border-emerald-200 hover:bg-emerald-50/40 transition"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {request.offerProductName || "Offer"}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <Badge>{request.incotermBuyer || "N/A"}</Badge>
                    <span className="text-slate-500">to {request.destination}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">Created {formatDate(request.createdAt)}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm shadow-sm"
                  onClick={() => onCreatePrivateOffer?.(request.id, request.offerId)}
                >
                  Create Private Offer
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold"
                  onClick={() => onOpenDetail?.(request.id)}
                >
                  View details
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              onClick={() => onRetry?.()}
            >
              Refresh list
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center">
          <div className="text-slate-700 font-semibold mb-2">
            No service requests needing your attention.
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Browse active offers to find opportunities to serve buyers.
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm shadow-sm"
            onClick={onBrowseOffers}
          >
            Browse Active Offers
          </button>
        </div>
      )}
    </div>
  );
};

export default IncomingServiceRequestsPanel;
