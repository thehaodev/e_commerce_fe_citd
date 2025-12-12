import React from "react";

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
    {children}
  </span>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-3 px-3">
      <div className="h-4 bg-slate-200 rounded w-28" />
    </td>
    <td className="py-3 px-3">
      <div className="h-4 bg-slate-200 rounded w-24" />
    </td>
    <td className="py-3 px-3">
      <div className="h-4 bg-slate-200 rounded w-16" />
    </td>
    <td className="py-3 px-3">
      <div className="h-4 bg-slate-200 rounded w-28" />
    </td>
    <td className="py-3 px-3">
      <div className="h-4 bg-slate-200 rounded w-24" />
    </td>
    <td className="py-3 px-3">
      <div className="h-4 bg-slate-200 rounded w-20" />
    </td>
    <td className="py-3 px-3">
      <div className="h-9 bg-slate-200 rounded" />
    </td>
  </tr>
);

/**
 * @typedef {Object} ServiceRequest
 * @property {string} id
 * @property {string} offerProductName
 * @property {string} [buyerName]
 * @property {"CFR" | "CIF" | "DAP" | "DDP"} incotermBuyer
 * @property {string} destination
 * @property {string} createdAt
 * @property {string} status
 * @property {boolean} [hasPrivateOffer]
 */

/**
 * @param {Object} props
 * @param {boolean} props.isLoading
 * @param {string | null} props.error
 * @param {ServiceRequest[]} props.serviceRequests
 * @param {() => void} [props.onRetry]
 * @param {(id: string) => void} [props.onOpenDetail]
 * @param {(id: string) => void} [props.onCreatePrivateOffer]
 * @param {(privateOfferId: string) => void} [props.onOpenPrivateOffer]
 */
const IncomingServiceRequestsPanel = ({
  isLoading,
  error,
  serviceRequests,
  onRetry,
  onOpenDetail,
  onCreatePrivateOffer,
  onOpenPrivateOffer,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Incoming Service Requests
          </h2>
          <p className="text-sm text-slate-500">
            Requests from buyers that need your private offers.
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
          <span className="text-sm">{error}</span>
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
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wide text-xs">
              <tr>
                <th className="text-left px-3 py-3">Offer</th>
                <th className="text-left px-3 py-3">Buyer</th>
                <th className="text-left px-3 py-3">Incoterm</th>
                <th className="text-left px-3 py-3">Destination</th>
                <th className="text-left px-3 py-3">Requested</th>
                <th className="text-left px-3 py-3">Status</th>
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
      ) : serviceRequests?.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wide text-xs">
              <tr>
                <th className="text-left px-3 py-3">Offer</th>
                <th className="text-left px-3 py-3">Buyer</th>
                <th className="text-left px-3 py-3">Incoterm</th>
                <th className="text-left px-3 py-3">Destination</th>
                <th className="text-left px-3 py-3">Requested</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {serviceRequests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 py-3 text-slate-900 font-medium">
                    {request.offerProductName}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {request.buyerName || "Buyer"}
                  </td>
                  <td className="px-3 py-3">
                    <Badge>{request.incotermBuyer}</Badge>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {request.destination}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3">
                    <Badge>{request.status}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    {request.hasPrivateOffer ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold"
                          onClick={() =>
                            request.privateOfferId && onOpenPrivateOffer?.(request.privateOfferId)
                          }
                        >
                          View Private Offer
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm shadow-sm"
                          onClick={() => onOpenDetail?.(request.id)}
                        >
                          View Request
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm shadow-sm"
                        onClick={() => onCreatePrivateOffer?.(request.id)}
                      >
                        Create Private Offer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          >
            Browse Active Offers
          </button>
        </div>
      )}
    </div>
  );
};

export default IncomingServiceRequestsPanel;
