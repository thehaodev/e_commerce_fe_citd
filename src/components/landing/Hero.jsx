import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { colors } from './colors';
import useFadeInOnScroll from '../../hooks/useFadeInOnScroll';

const Hero = () => {
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section
      ref={ref}
      className={`relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden opacity-0 ${
        isVisible ? 'animate-fade-up' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold mb-6 tracking-wide uppercase">
          The Future of B2B Logistics
        </span>
        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
          style={{ color: colors.primaryBlack }}
        >
          Connect. Trade.{' '}
          <span className="relative inline-block">
            Deliver.
            <svg
              className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-60"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10">
          The unified 3-party platform connecting Sellers, Buyers, and Service Providers. Manage Offers, negotiate
          Incoterms, and award logistics contracts in one secure hub.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            className="px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:scale-105 flex items-center justify-center"
            style={{ backgroundColor: colors.primaryYellow, color: colors.primaryBlack }}
          >
            Start Trading Now <FiArrowRight className="ml-2" />
          </button>
          <button
            className="px-8 py-4 rounded-full text-lg font-bold bg-white border-2 border-gray-200 hover:border-black transition-all duration-300 hover:scale-105 flex items-center justify-center"
            style={{ color: colors.primaryBlack }}
          >
            Create Offer
          </button>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-200 pt-8">
          {[
            { label: 'Active Offers', value: '2,500+' },
            { label: 'Service Providers', value: '150+' },
            { label: 'Successful Awards', value: '98%' },
            { label: 'Avg. Response', value: '< 500ms' },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-3xl font-bold" style={{ color: colors.primaryBlack }}>
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
