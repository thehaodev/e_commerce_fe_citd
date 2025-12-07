import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const formatPrice = (price) => {
  if (price === undefined || price === null || Number.isNaN(Number(price))) return "N/A";
  return Number(price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const OfferTable = ({ offers, colors }) => (
  <div className="overflow-x-auto">
    <table className="w-full mb-6">
      <thead>
        <tr
          className="text-left text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: colors.gray100, color: colors.gray600 }}
        >
          <th className="px-6 py-4 rounded-tl-lg">Offer ID</th>
          <th className="px-6 py-4">Product</th>
          <th className="px-6 py-4">Price</th>
          <th className="px-6 py-4">Incoterm</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">CRD</th>
          <th className="px-6 py-4 rounded-tr-lg">Action</th>
        </tr>
      </thead>
      <tbody>
        {offers.map((offer) => (
          <tr
            key={offer.id}
            className="hover:bg-gray-50 transition-colors"
            style={{ borderBottom: `1px solid ${colors.gray200}` }}
          >
            <td className="px-6 py-4 font-medium" style={{ color: colors.primaryBlack }}>
              {offer.id}
            </td>
            <td className="px-6 py-4 font-bold" style={{ color: colors.primaryBlack }}>
              {offer.product_name || offer.product || "N/A"}
            </td>
            <td className="px-6 py-4" style={{ color: colors.gray900 }}>
              {formatPrice(offer.price ?? offer.totalPrice)}
            </td>
            <td className="px-6 py-4" style={{ color: colors.gray600 }}>
              {offer.seller_incoterm || offer.incoterm || "N/A"}
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={offer.status} colors={colors} />
            </td>
            <td className="px-6 py-4" style={{ color: colors.gray600 }}>
              {formatDate(offer.cargo_ready_date || offer.crd)}
            </td>
            <td className="px-6 py-4">
              <Link
                to={`/seller/offers/${offer.id}`}
                className="font-bold hover:underline"
                style={{ color: colors.primaryYellow }}
              >
                View details &gt;
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default OfferTable;
