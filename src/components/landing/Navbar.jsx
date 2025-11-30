import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { colors } from './colors';

const Navbar = ({ onLoginClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="animate-fade-up w-full">
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-3xl font-extrabold tracking-tighter" style={{ color: colors.primaryBlack }}>
                CABIN
              </h1>
            </div>

            <div className="hidden md:flex space-x-8 items-center">
              <a href="#how-it-works" className="text-gray-600 hover:text-black font-medium transition">
                How it Works
              </a>
              <a href="#features" className="text-gray-600 hover:text-black font-medium transition">
                Features
              </a>
              <a href="#roles" className="text-gray-600 hover:text-black font-medium transition">
                For Partners
              </a>
              <button onClick={onLoginClick} className="text-gray-900 font-bold hover:underline">
                Log in
              </button>
              <button
                className="px-6 py-2.5 rounded-full font-bold transition transform hover:-translate-y-0.5 shadow-sm"
                style={{ backgroundColor: colors.primaryYellow, color: colors.primaryBlack }}
              >
                Get Started
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900">
                {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-gray-700">
                How it Works
              </a>
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700">
                Features
              </a>
              <button
                onClick={onLoginClick}
                className="block px-3 py-2 text-base font-medium text-gray-700"
              >
                Log in
              </button>
              <button
                className="w-full mt-4 px-6 py-3 rounded-lg font-bold"
                style={{ backgroundColor: colors.primaryYellow, color: colors.primaryBlack }}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
