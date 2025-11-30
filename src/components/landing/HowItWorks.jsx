import React from 'react';
import { FiBox, FiShoppingCart, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { colors } from './colors';
import useFadeInOnScroll from '../../hooks/useFadeInOnScroll';

const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Seller Posts Offer',
      desc: 'Sellers publish goods with defined Incoterms (EXW, FCA, FOB) and availability dates.',
      icon: <FiBox size={24} />,
    },
    {
      num: '02',
      title: 'Buyer Interest & SR',
      desc: 'Buyers view offers, express Interest, and send Service Requests (SR) for logistics.',
      icon: <FiShoppingCart size={24} />,
    },
    {
      num: '03',
      title: 'Provider Proposal',
      desc: 'Service Providers analyze SRs and submit Private Offers & detailed Proposals.',
      icon: <FiTruck size={24} />,
    },
    {
      num: '04',
      title: 'Award & Approval',
      desc: 'Buyer selects the winning Provider. System records the Award pending Admin review.',
      icon: <FiCheckCircle size={24} />,
    },
  ];

  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section
      id="how-it-works"
      ref={ref}
      className={`py-24 bg-gray-50 opacity-0 ${isVisible ? 'animate-fade-up' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.primaryBlack }}>
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">A seamless workflow from product listing to final logistics award.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-xl font-bold"
                style={{ backgroundColor: colors.gray100, color: colors.primaryBlack }}
              >
                {step.icon}
              </div>
              <div className="absolute top-6 right-6 text-4xl font-black text-gray-100 -z-0">{step.num}</div>
              <h3 className="text-xl font-bold mb-3 relative z-10" style={{ color: colors.primaryBlack }}>
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
