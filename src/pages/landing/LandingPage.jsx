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
  const [serverUnstable, setServerUnstable] = useState(false);
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

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 3000);

    const checkHealth = async () => {
      try {
        const res = await fetch("https://e-commerce-be-citd-staging.onrender.com/health", {
          signal: controller.signal,
        });
        if (!res.ok) {
          if (isMounted) setServerUnstable(true);
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (data?.status !== "ok" && isMounted) {
          setServerUnstable(true);
        }
      } catch (err) {
        if (isMounted) setServerUnstable(true);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen">
      {serverUnstable && (
        <div className="bg-yellow-100 text-yellow-800 text-sm py-2 px-4 text-center">
          Server is starting or unstable (free Render). If things are slow, please try again in a few seconds.
        </div>
      )}
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
