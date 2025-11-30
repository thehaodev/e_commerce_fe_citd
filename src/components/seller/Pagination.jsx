import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ colors }) => (
  <div className="flex justify-end items-center gap-2">
    <button className="px-4 py-2 rounded-lg border bg-white font-semibold flex items-center" style={{ color: colors.primaryBlack, borderColor: colors.gray200 }}>
      <FiChevronLeft size={20} className="mr-1" /> Previous
    </button>
    <button className="px-4 py-2 rounded-lg font-semibold" style={{ backgroundColor: colors.primaryBlack, color: colors.primaryWhite }}>1</button>
    <button className="px-4 py-2 rounded-lg font-semibold hover:bg-gray-100" style={{ color: colors.gray600 }}>2</button>
    <button className="px-4 py-2 rounded-lg font-semibold hover:bg-gray-100" style={{ color: colors.gray600 }}>3</button>
    <span className="px-2" style={{ color: colors.gray600 }}>...</span>
    <button className="px-4 py-2 rounded-lg font-semibold hover:bg-gray-100" style={{ color: colors.gray600 }}>10</button>
    <button className="px-4 py-2 rounded-lg border bg-white font-semibold flex items-center" style={{ color: colors.primaryBlack, borderColor: colors.gray200 }}>
      Next <FiChevronRight size={20} className="ml-1" />
    </button>
  </div>
);

export default Pagination;
