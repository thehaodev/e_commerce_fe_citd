import React from 'react';
import { colors } from './colors';
import useFadeInOnScroll from '../../hooks/useFadeInOnScroll';

const RoleCards = () => {
  const roles = [
    {
      title: 'For Sellers',
      desc: 'List your products globally. Manage Incoterms (EXW, FCA, FOB) and track interest in real-time.',
      cta: 'Explore as Seller',
      color: 'bg-yellow-50',
    },
    {
      title: 'For Buyers',
      desc: 'Source products and request logistics services (CFR, CIF, DAP, DDP) in a single click.',
      cta: 'Explore as Buyer',
      color: 'bg-blue-50',
    },
    {
      title: 'Service Providers',
      desc: 'Access a stream of Service Requests. Submit Proposals and win contracts efficiently.',
      cta: 'Join as Provider',
      color: 'bg-green-50',
    },
    {
      title: 'Admins',
      desc: 'Oversee the ecosystem. Moderate Offers, approve Awards, and ensure compliance.',
      cta: 'Admin Portal',
      color: 'bg-gray-50',
    },
  ];

  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section
      id="roles"
      ref={ref}
      className={`py-24 bg-white opacity-0 ${isVisible ? 'animate-fade-up' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl ${role.color} bg-opacity-50 hover:bg-opacity-100 transition duration-300`}
            >
              <h3 className="text-2xl font-bold mb-4" style={{ color: colors.primaryBlack }}>
                {role.title}
              </h3>
              <p className="text-gray-600 mb-8 min-h-[80px]">{role.desc}</p>
              <button className="font-bold border-b-2 border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-all duration-300 hover:scale-105">
                {role.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
