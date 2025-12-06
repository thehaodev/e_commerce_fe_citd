import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const formatPrice = (price) => {
  if (price === undefined || price === null || Number.isNaN(Number(price))) return "—";
  return Number(price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const OfferTable = ({ offers, onView }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
      <table className="min-w-full">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left">Thumbnail</th>
            <th className="px-4 py-3 text-left">Product</th>
            <th className="px-4 py-3 text-left">Quantity</th>
            <th className="px-4 py-3 text-left">Price</th>
            <th className="px-4 py-3 text-left">Incoterm</th>
            <th className="px-4 py-3 text-left">Port</th>
            <th className="px-4 py-3 text-left">CRD</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Created</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {offers.map((offer) => {
            const firstImage =
              Array.isArray(offer.images) && offer.images.length > 0
                ? offer.images[0]
                : null;
            return (
              <tr key={offer.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={offer.product_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">
                        N/A
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/seller/offers/${offer.id}`}
                    className="font-semibold text-slate-900 hover:text-amber-700"
                  >
                    {offer.product_name || "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {offer.quantity ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {formatPrice(offer.price)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {offer.seller_incoterm || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {offer.port_of_loading || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {formatDate(offer.cargo_ready_date)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={offer.status} />
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {formatDate(offer.created_at || offer.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onView?.(offer)}
                    className="text-sm font-semibold text-amber-700 hover:text-amber-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OfferTable;
