import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import HowItWorks from '../../components/landing/HowItWorks';
import RoleCards from '../../components/landing/RoleCards';
import PlatformHighlights from '../../components/landing/PlatformHighlights';
import Footer from '../../components/landing/Footer';
import LoginModal from '../../components/login/LoginModal';
import useAuth, { getRedirectPathForRole } from '../../hooks/useAuth';

export default function LandingPage({ defaultLoginOpen = false }) {
  const { user, isLoggedIn, authInitialized } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(defaultLoginOpen);
  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  useEffect(() => {
    setShowLogin(defaultLoginOpen);
  }, [defaultLoginOpen]);

  useEffect(() => {
    if (!authInitialized) return;
    if (isLoggedIn && user) {
      navigate(getRedirectPathForRole(user.role), { replace: true });
    }
  }, [authInitialized, isLoggedIn, user, navigate]);

  if (!authInitialized) {
    return null;
  }

  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen">
      <Navbar onLoginClick={openLogin} />
      <Hero />
      <HowItWorks />
      <RoleCards />
      <PlatformHighlights />
      <Footer />
      {showLogin && (
        <LoginModal
          onClose={closeLogin}
        />
      )}
    </div>
  );
}
