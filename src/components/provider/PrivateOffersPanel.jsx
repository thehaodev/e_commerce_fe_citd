import React from "react";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
    {status}
  </span>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-32" />
    </td>
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-20" />
    </td>
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-28" />
    </td>
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-24" />
    </td>
    <td className="px-3 py-3">
      <div className="h-4 bg-slate-200 rounded w-24" />
    </td>
    <td className="px-3 py-3">
      <div className="h-9 bg-slate-200 rounded" />
    </td>
  </tr>
);

/**
 * @typedef {Object} PrivateOffer
 * @property {string} id
 * @property {string} offer_id
 * @property {string} service_request_id
 * @property {string} negotiated_price
 * @property {string | null} updated_crd
 * @property {string | null} updated_etd
 * @property {string} seller_documentation
 * @property {"PRIVATE_OFFER_CREATED"} status
 * @property {string} created_at
 */

/**
 * @param {Object} props
 * @param {boolean} props.isLoading
 * @param {string | null} props.error
 * @param {PrivateOffer[]} props.privateOffers
 */
const PrivateOffersPanel = ({ isLoading, error, privateOffers }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            My Private Offers
          </h2>
          <p className="text-sm text-slate-500">
            Track offers negotiated with sellers for specific service requests.
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-slate-700 underline"
          onClick={() => navigate("/provider/private-offers")}
        >
          View all
        </button>
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
                <th className="text-left px-3 py-3">Negotiated Price</th>
                <th className="text-left px-3 py-3">Updated CRD/ETD</th>
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
      ) : privateOffers?.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wide text-xs">
              <tr>
                <th className="text-left px-3 py-3">Offer</th>
                <th className="text-left px-3 py-3">Negotiated Price</th>
                <th className="text-left px-3 py-3">Updated CRD/ETD</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Created</th>
                <th className="text-left px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {privateOffers.map((offer) => (
                <tr
                  key={offer.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 py-3 text-slate-900 font-medium">
                    {offer.offer_id}
                    <div className="text-xs text-slate-500">
                      SR #{offer.service_request_id}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {offer.negotiated_price || "N/A"}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {offer.updated_crd || offer.updated_etd
                      ? [offer.updated_crd, offer.updated_etd]
                          .filter(Boolean)
                          .join(" / ")
                      : "N/A"}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={offer.status} />
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm shadow-sm"
                      onClick={() =>
                        navigate(`/provider/private-offers/${offer.id}`)
                      }
                    >
                      Open
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
            You have not created any private offers yet.
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Start by responding to a service request.
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm shadow-sm"
            onClick={() => navigate("/provider/service-requests")}
          >
            View Service Requests
          </button>
        </div>
      )}
    </div>
  );
};

export default PrivateOffersPanel;