import React from 'react';
import { FiPlus } from 'react-icons/fi';

const Header = ({ colors }) => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-3xl font-bold" style={{ color: colors.primaryBlack }}>Manage Offers</h1>
    <button className="flex items-center px-4 py-2 rounded-full bg-white border shadow-sm font-semibold" style={{ color: colors.primaryBlack, borderColor: colors.gray200 }}>
      Create New Offer
      <span className="ml-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primaryYellow }}>
        <FiPlus size={20} />
      </span>
    </button>
  </div>
);

export default Header;
