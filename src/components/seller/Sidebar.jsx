import React from 'react';

const Sidebar = ({ colors }) => (
  <div className="w-64 bg-white h-screen fixed left-0 top-0 flex flex-col p-6 shadow-sm">
    <h1 className="text-3xl font-bold mb-10" style={{ color: colors.primaryBlack }}>CABIN</h1>
    <nav className="flex-1">
      <a href="#" className="flex items-center px-4 py-3 rounded-lg mb-2" style={{ backgroundColor: colors.primaryBlack, color: colors.primaryWhite }}>
        Manage Offer
      </a>
      <a href="#" className="flex items-center px-4 py-3 rounded-lg" style={{ color: colors.gray600 }}>
        Settings
      </a>
    </nav>
    <div className="text-sm" style={{ color: colors.gray600 }}>
      <div className="mb-4">
        <a href="#" className="mr-4">Footer</a>
        <a href="#">Links</a>
      </div>
      <div>
        <a href="#" className="mr-4">Privacy Policy</a>
        <a href="#">Terms</a>
      </div>
    </div>
  </div>
);

export default Sidebar;
