import React from 'react';
import useFadeInOnScroll from '../../hooks/useFadeInOnScroll';

const Footer = () => {
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <footer
      ref={ref}
      className={`bg-white pt-16 pb-8 border-t border-gray-200 opacity-0 ${isVisible ? 'animate-fade-up' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-extrabold mb-4">CABIN</h2>
            <p className="text-gray-500 max-w-xs">
              The premier ecosystem for Sellers, Buyers, and Service Providers to trade and manage logistics globally.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-black">
                  Browse Offers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Service Requests
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Provider Network
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-black">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© 2024 CABIN Logistics Platform. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
