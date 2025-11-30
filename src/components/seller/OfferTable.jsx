import React from 'react';
import StatusBadge from './StatusBadge';

const OfferTable = ({ offers, colors }) => (
  <div className="overflow-x-auto">
    <table className="w-full mb-6">
      <thead>
        <tr className="text-left text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: colors.gray100, color: colors.gray600 }}>
          <th className="px-6 py-4 rounded-tl-lg">Offer ID</th>
          <th className="px-6 py-4">Product</th>
          <th className="px-6 py-4">Total Price</th>
          <th className="px-6 py-4">Incoterm</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">CRD</th>
          <th className="px-6 py-4 rounded-tr-lg">Action</th>
        </tr>
      </thead>
      <tbody>
        {offers.map((offer, index) => (
          <tr key={index} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: `1px solid ${colors.gray200}` }}>
            <td className="px-6 py-4 font-medium" style={{ color: colors.primaryBlack }}>{offer.id}</td>
            <td className="px-6 py-4 font-bold" style={{ color: colors.primaryBlack }}>{offer.product}</td>
            <td className="px-6 py-4" style={{ color: colors.gray900 }}>{offer.totalPrice}</td>
            <td className="px-6 py-4" style={{ color: colors.gray600 }}>{offer.incoterm}</td>
            <td className="px-6 py-4"><StatusBadge status={offer.status} colors={colors} /></td>
            <td className="px-6 py-4" style={{ color: colors.gray600 }}>{offer.crd}</td>
            <td className="px-6 py-4">
              <a href="#" className="font-bold hover:underline" style={{ color: colors.primaryYellow }}>View details ></a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default OfferTable;
