import React, { useState } from 'react';
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import HowItWorks from '../../components/landing/HowItWorks';
import RoleCards from '../../components/landing/RoleCards';
import PlatformHighlights from '../../components/landing/PlatformHighlights';
import Footer from '../../components/landing/Footer';
import LoginModal from '../../components/login/LoginModal';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen">
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <Hero />
      <HowItWorks />
      <RoleCards />
      <PlatformHighlights />
      <Footer />
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}
