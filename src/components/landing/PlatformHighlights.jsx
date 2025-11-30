import React from 'react';
import { FiActivity, FiShield, FiGlobe } from 'react-icons/fi';
import useFadeInOnScroll from '../../hooks/useFadeInOnScroll';

const PlatformHighlights = () => {
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section
      id="features"
      ref={ref}
      className={`py-24 bg-black text-white rounded-t-[40px] md:rounded-t-[80px] mt-10 opacity-0 ${
        isVisible ? 'animate-fade-up' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Enterprise Scale</h2>
          <p className="text-gray-400 max-w-2xl">
            Our platform meets rigorous non-functional requirements for security, performance, and scalability.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="mb-4 text-yellow-400">
              <FiActivity size={32} />
            </div>
            <h4 className="text-xl font-bold mb-3">High Performance</h4>
            <p className="text-gray-400 text-sm">
              Engineered for speed with API response times under 500ms. Handles high concurrency via horizontal scaling.
            </p>
          </div>
          <div>
            <div className="mb-4 text-yellow-400">
              <FiShield size={32} />
            </div>
            <h4 className="text-xl font-bold mb-3">Bank-Grade Security</h4>
            <p className="text-gray-400 text-sm">
              End-to-end encryption with TLS 1.3. JWT-based authentication ensures secure access for all parties.
            </p>
          </div>
          <div>
            <div className="mb-4 text-yellow-400">
              <FiGlobe size={32} />
            </div>
            <h4 className="text-xl font-bold mb-3">Audit & Compliance</h4>
            <p className="text-gray-400 text-sm">
              Comprehensive audit logs for every Offer, Proposal, and Award. Full transparency for Admins.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformHighlights;
