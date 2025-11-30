import React from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

const SearchFilterBar = ({ colors }) => (
  <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
    <div className="relative flex-grow max-w-md">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.gray400 }} size={20} />
      <input
        type="text"
        placeholder="Search by Offer ID or Product..."
        className="w-full pl-10 pr-4 py-3 rounded-lg border-none focus:ring-0"
        style={{ backgroundColor: colors.gray100, color: colors.primaryBlack }}
      />
    </div>
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative">
        <select className="appearance-none px-4 py-3 pr-10 rounded-lg border bg-white focus:ring-0 focus:border-black cursor-pointer" style={{ color: colors.primaryBlack, borderColor: colors.gray200 }}>
          <option>Status</option>
          <option>OPEN</option>
          <option>ACTIVE</option>
          <option>LOCKED</option>
        </select>
        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: colors.gray600 }} size={20} />
      </div>
      <div className="relative">
        <select className="appearance-none px-4 py-3 pr-10 rounded-lg border bg-white focus:ring-0 focus:border-black cursor-pointer" style={{ color: colors.primaryBlack, borderColor: colors.gray200 }}>
          <option>Incoterm</option>
          <option>EXW</option>
          <option>FCA</option>
          <option>FOB</option>
        </select>
        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: colors.gray600 }} size={20} />
      </div>
      <div className="relative">
        <button className="px-4 py-3 pr-10 rounded-lg border bg-white focus:ring-0 focus:border-black text-left w-full flex items-center justify-between" style={{ color: colors.primaryBlack, borderColor: colors.gray200 }}>
          <span>Date Range</span>
          <FiChevronDown style={{ color: colors.gray600 }} size={20} />
        </button>
      </div>
      <button className="px-4 py-3 rounded-lg font-semibold" style={{ color: colors.gray600 }}>
        Clear filters
      </button>
    </div>
    <div className="relative ml-auto">
      <select className="appearance-none px-4 py-3 pr-10 rounded-lg border bg-white focus:ring-0 focus:border-black cursor-pointer" style={{ color: colors.primaryBlack, borderColor: colors.gray200 }}>
        <option>Sort by</option>
        <option>Created Date</option>
        <option>CRD</option>
        <option>Status</option>
      </select>
      <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: colors.gray600 }} size={20} />
    </div>
  </div>
);

export default SearchFilterBar;
